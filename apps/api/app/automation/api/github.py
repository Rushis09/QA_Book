import os

import requests
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.automation.models.github_connection import GitHubConnection
from app.automation.schemas.github import GitHubRepositorySelectRequest
from app.automation.services.github_api_service import GitHubAPIService
from app.automation.services.github_connection_service import (
    GitHubConnectionService,
)
from app.automation.services.github_oauth_state_service import (
    GitHubOAuthStateService,
)

from app.auth.dependencies import get_current_admin
from app.db.session import get_db
from app.models.admin import Admin


DOTENV_FILE = os.getenv("DOTENV_FILE", ".env")
load_dotenv(DOTENV_FILE, override=True)

router = APIRouter(
    prefix="/automation/github",
    tags=["Automation GitHub"],
)


@router.get("/authorize")
def github_authorize(
    automation_project_id: int = Query(...),
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    from app.automation.models.automation_project import AutomationProject

    automation_project = (
        db.query(AutomationProject)
        .join(AutomationProject.project)
        .filter(
            AutomationProject.id == automation_project_id,
            AutomationProject.project.has(admin_id=admin.id),
        )
        .first()
    )

    if not automation_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Automation project not found.",
        )

    client_id = os.getenv("GITHUB_CLIENT_ID")

    if not client_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GitHub Client ID is not configured.",
        )

    redirect_uri = os.getenv(
        "GITHUB_REDIRECT_URI",
        "http://localhost:8000/automation/github/callback",
    )

    oauth_state_service = GitHubOAuthStateService(db)

    state = oauth_state_service.create_state(
        admin_id=admin.id,
        automation_project_id=automation_project_id,
    )

    github_url = (
        "https://github.com/login/oauth/authorize"
        f"?client_id={client_id}"
        "&allow_signup=false"
        f"&redirect_uri={redirect_uri}"
        f"&state={state}"
    )

    # GitHub's "Request user authorization (OAuth) during installation"
    # flow does not reliably return our custom state parameter after
    # installation. Store the state in a short-lived HttpOnly cookie so
    # the callback can securely recover the QABook authorization context.
    response = Response(
        content=(
            '{"authorization_url":'
            f'"{github_url}"'
            "}"
        ),
        media_type="application/json",
    )

    response.set_cookie(
        key="qabook_github_oauth_state",
        value=state,
        max_age=10 * 60,
        httponly=True,
        secure=False,
        samesite="lax",
    )

    return response


@router.get("/callback")
def github_callback(
    request: Request,
    code: str,
    state: str | None = None,
    db: Session = Depends(get_db),
):
    # GitHub may return the OAuth code without returning the QABook state
    # when OAuth authorization is requested during App installation.
    # Prefer GitHub's state if present; otherwise recover our state from
    # the short-lived browser cookie created by /authorize.
    oauth_state_value = state or request.cookies.get(
        "qabook_github_oauth_state"
    ) or state

    if not oauth_state_value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub authorization state is missing.",
        )

    oauth_state_service = GitHubOAuthStateService(db)

    oauth_state = oauth_state_service.consume_state(
        oauth_state_value
    )

    client_id = os.getenv("GITHUB_CLIENT_ID")
    client_secret = os.getenv("GITHUB_CLIENT_SECRET")

    if not client_id or not client_secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GitHub OAuth credentials are not configured.",
        )

    redirect_uri = os.getenv(
        "GITHUB_REDIRECT_URI",
        "http://localhost:8000/automation/github/callback",
    )

    token_response = requests.post(
        "https://github.com/login/oauth/access_token",
        headers={
            "Accept": "application/json",
        },
        data={
            "client_id": client_id,
            "client_secret": client_secret,
            "code": code,
            "redirect_uri": redirect_uri,
        },
        timeout=15,
    )

    if token_response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to exchange GitHub authorization code.",
        )

    token_data = token_response.json()

    print(
        "GITHUB TOKEN DATA KEYS:",
        list(token_data.keys()),
    )

    access_token = token_data.get("access_token")

    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="GitHub did not return an access token.",
        )

    user_response = requests.get(
        "https://api.github.com/user",
        headers={
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {access_token}",
            "X-GitHub-Api-Version": "2022-11-28",
        },
        timeout=15,
    )

    if user_response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to retrieve GitHub user information.",
        )

    github_user = user_response.json()

    github_username = github_user.get("login")

    if not github_username:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="GitHub user information is missing.",
        )

    github_api_service = GitHubAPIService()

    installation = github_api_service.get_user_installation(
        github_username
    )

    installation_id = installation.get("id")

    if not installation_id:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="GitHub App installation ID is missing.",
        )

    connection = (
        db.query(GitHubConnection)
        .filter(
            GitHubConnection.automation_project_id
            == oauth_state.automation_project_id
        )
        .first()
    )

    # GitHub OAuth may return expiration information for
    # expiring user access tokens.
    access_token_expires_at = None
    refresh_token_expires_at = None

    expires_in = token_data.get("expires_in")
    refresh_token_expires_in = token_data.get(
        "refresh_token_expires_in"
    )

    if expires_in is not None:
        from datetime import datetime, timedelta, timezone

        access_token_expires_at = (
            datetime.now(timezone.utc)
            + timedelta(seconds=int(expires_in))
        )

    if refresh_token_expires_in is not None:
        from datetime import datetime, timedelta, timezone

        refresh_token_expires_at = (
            datetime.now(timezone.utc)
            + timedelta(
                seconds=int(refresh_token_expires_in)
            )
        )

    if connection:
        connection.installation_id = str(
            installation_id
        )
        connection.github_username = github_username
        connection.github_access_token = access_token
        connection.github_refresh_token = token_data.get(
            "refresh_token"
        )
        connection.access_token_expires_at = (
            access_token_expires_at
        )
        connection.refresh_token_expires_at = (
            refresh_token_expires_at
        )
    else:
        connection = GitHubConnection(
            automation_project_id=(
                oauth_state.automation_project_id
            ),
            installation_id=str(installation_id),
            github_username=github_username,
            github_access_token=access_token,
            github_refresh_token=token_data.get(
                "refresh_token"
            ),
            access_token_expires_at=(
                access_token_expires_at
            ),
            refresh_token_expires_at=(
                refresh_token_expires_at
            ),
            branch="main",
        )
        db.add(connection)

    db.commit()

    frontend_url = os.getenv(
        "FRONTEND_BASE_URL",
        "http://localhost:5173",
    )

    redirect_response = RedirectResponse(
        url=f"{frontend_url}/automation?github=connected",
        status_code=303,
    )

    redirect_response.delete_cookie(
        key="qabook_github_oauth_state"
    )

    return redirect_response


@router.get("/connection")
def get_github_connection(
    automation_project_id: int = Query(...),
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    from app.automation.models.automation_project import AutomationProject

    automation_project = (
        db.query(AutomationProject)
        .join(AutomationProject.project)
        .filter(
            AutomationProject.id == automation_project_id,
            AutomationProject.project.has(admin_id=admin.id),
        )
        .first()
    )

    if not automation_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Automation project not found.",
        )

    connection = (
        db.query(GitHubConnection)
        .filter(
            GitHubConnection.automation_project_id
            == automation_project_id
        )
        .first()
    )

    if not connection:
        return {
            "connected": False,
            "github_connection_id": None,
            "installation_id": None,
            "repository_owner": None,
            "repository_name": None,
            "branch": None,
            "repository_url": None,
        }

    repository_url = None

    if (
        connection.repository_owner
        and connection.repository_name
    ):
        repository_url = (
            f"https://github.com/"
            f"{connection.repository_owner}/"
            f"{connection.repository_name}"
        )

    return {
        "connected": True,
        "github_connection_id": connection.id,
        "installation_id": connection.installation_id,
        "repository_owner": connection.repository_owner,
        "repository_name": connection.repository_name,
        "branch": connection.branch,
        "repository_url": repository_url,
    }


@router.post("/generate-framework")
def generate_github_framework(
    automation_project_id: int = Query(...),
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    service = GitHubConnectionService(db)

    return service.generate_and_push_framework(
        automation_project_id=automation_project_id,
        admin_id=admin.id,
    )


@router.post("/sync-framework")
def sync_github_framework(
    automation_project_id: int = Query(...),
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    service = GitHubConnectionService(db)

    return service.sync_framework(
        automation_project_id=automation_project_id,
        admin_id=admin.id,
    )

@router.get("/repositories")
def get_github_repositories(
    automation_project_id: int = Query(...),
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    from app.automation.models.automation_project import AutomationProject

    automation_project = (
        db.query(AutomationProject)
        .join(AutomationProject.project)
        .filter(
            AutomationProject.id == automation_project_id,
            AutomationProject.project.has(admin_id=admin.id),
        )
        .first()
    )

    if not automation_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Automation project not found.",
        )

    connection = (
        db.query(GitHubConnection)
        .filter(
            GitHubConnection.automation_project_id
            == automation_project_id
        )
        .first()
    )

    if not connection:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub is not connected to this automation project.",
        )

    github_api_service = GitHubAPIService()

    repositories = github_api_service.list_installation_repositories(
        connection.installation_id
    )

    return {
        "automation_project_id": automation_project_id,
        "github_connection_id": connection.id,
        "repositories": repositories,
    }


@router.put("/repository")
def select_github_repository(
    data: GitHubRepositorySelectRequest,
    automation_project_id: int = Query(...),
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    from app.automation.models.automation_project import AutomationProject

    automation_project = (
        db.query(AutomationProject)
        .join(AutomationProject.project)
        .filter(
            AutomationProject.id == automation_project_id,
            AutomationProject.project.has(admin_id=admin.id),
        )
        .first()
    )

    if not automation_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Automation project not found.",
        )

    connection = (
        db.query(GitHubConnection)
        .filter(
            GitHubConnection.automation_project_id
            == automation_project_id
        )
        .first()
    )

    if not connection:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub is not connected to this automation project.",
        )

    github_api_service = GitHubAPIService()

    repository = github_api_service.get_repository(
        connection.installation_id,
        data.repository_owner,
        data.repository_name,
    )

    connection.repository_owner = repository.get(
        "owner", {}
    ).get(
        "login",
        data.repository_owner,
    )

    connection.repository_name = repository.get(
        "name",
        data.repository_name,
    )

    connection.branch = (
        data.branch.strip()
        or repository.get("default_branch")
        or "main"
    )

    db.commit()

    repository_url = (
        f"https://github.com/"
        f"{connection.repository_owner}/"
        f"{connection.repository_name}"
    )

    return {
        "message": "GitHub repository connected successfully.",
        "automation_project_id": automation_project_id,
        "github_connection_id": connection.id,
        "installation_id": connection.installation_id,
        "repository_owner": connection.repository_owner,
        "repository_name": connection.repository_name,
        "branch": connection.branch,
        "repository_url": repository_url,
    }