import base64

import requests
from fastapi import HTTPException, status

from app.automation.services.github_auth_service import (
    GitHubAuthService,
)


class GitHubAPIService:
    GITHUB_API_URL = "https://api.github.com"
    API_VERSION = "2022-11-28"

    def __init__(self):
        self.auth_service = GitHubAuthService()

    @classmethod
    def _headers(cls, token: str) -> dict[str, str]:
        return {
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {token}",
            "X-GitHub-Api-Version": cls.API_VERSION,
        }

    def get_user_installation(
        self,
        github_username: str,
    ) -> dict:
        """
        Find the GitHub App installation for a GitHub user.

        The request is authenticated as the GitHub App itself
        using the App JWT.
        """
        if not github_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="GitHub username is required.",
            )

        app_jwt = self.auth_service.create_app_jwt()

        response = requests.get(
            f"{self.GITHUB_API_URL}/users/"
            f"{github_username}/installation",
            headers=self._headers(app_jwt),
            timeout=15,
        )

        if response.status_code == 404:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    "GitHub App is not installed for this "
                    "GitHub account."
                ),
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=(
                    "GitHub App installation lookup failed."
                ),
            )

        return response.json()

    def create_installation_access_token(
        self,
        installation_id: int,
    ) -> str:
        """
        Create a short-lived access token for a GitHub App
        installation.
        """
        if not installation_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="GitHub installation ID is required.",
            )

        app_jwt = self.auth_service.create_app_jwt()

        response = requests.post(
            f"{self.GITHUB_API_URL}/app/installations/"
            f"{installation_id}/access_tokens",
            headers=self._headers(app_jwt),
            timeout=15,
        )

        if response.status_code != 201:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=(
                    "GitHub installation access token "
                    "creation failed."
                ),
            )

        token_data = response.json()

        access_token = token_data.get("token")

        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=(
                    "GitHub did not return an installation "
                    "access token."
                ),
            )

        return access_token

    def list_installation_repositories(
        self,
        installation_id: int,
    ) -> list[dict]:
        """
        Return repositories accessible to the GitHub App
        installation.
        """
        access_token = self.create_installation_access_token(
            installation_id
        )

        repositories: list[dict] = []
        page = 1

        while True:
            response = requests.get(
                f"{self.GITHUB_API_URL}/installation/"
                f"repositories",
                headers=self._headers(access_token),
                params={
                    "per_page": 100,
                    "page": page,
                },
                timeout=15,
            )

            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=(
                        "GitHub repository listing failed."
                    ),
                )

            data = response.json()

            page_repositories = data.get(
                "repositories",
                []
            )

            repositories.extend(page_repositories)

            if len(page_repositories) < 100:
                break

            page += 1

        return repositories

    def get_repository(
        self,
        installation_id: int,
        repository_owner: str,
        repository_name: str,
    ) -> dict:
        """
        Get a repository accessible to the GitHub App installation.
        """
        access_token = self.create_installation_access_token(
            installation_id
        )

        response = requests.get(
            f"{self.GITHUB_API_URL}/repos/"
            f"{repository_owner}/{repository_name}",
            headers=self._headers(access_token),
            timeout=15,
        )

        if response.status_code == 404:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="GitHub repository not found or not accessible.",
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="GitHub repository lookup failed.",
            )

        return response.json()

    def create_repository(
        self,
        user_access_token: str,
        repository_name: str,
        description: str | None = None,
        private: bool = True,
    ) -> dict:
        """
        Create a new repository in the authorized GitHub user's account.

        This uses the OAuth user access token, not the GitHub App
        installation access token.
        """
        if not user_access_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="GitHub user access token is required.",
            )

        if not repository_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="GitHub repository name is required.",
            )

        response = requests.post(
            f"{self.GITHUB_API_URL}/user/repos",
            headers=self._headers(user_access_token),
            json={
                "name": repository_name,
                "description": description,
                "private": private,
                "auto_init": True,
            },
            timeout=15,
        )

        if response.status_code == 422:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "GitHub repository could not be created. "
                    "The repository name may already exist."
                ),
            )

        if response.status_code == 403:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "GitHub denied repository creation. "
                    "Check the GitHub App repository permissions."
                ),
            )

        if response.status_code != 201:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="GitHub repository creation failed.",
            )

        return response.json()

    def upload_file(
        self,
        user_access_token: str,
        repository_owner: str,
        repository_name: str,
        file_path: str,
        content: str,
        branch: str,
        commit_message: str,
    ) -> dict:
        """
        Create or update a file in a GitHub repository.

        Uses the OAuth user access token belonging to the
        authorized GitHub user.
        """
        if not user_access_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="GitHub user access token is required.",
            )

        if not repository_owner:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="GitHub repository owner is required.",
            )

        if not repository_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="GitHub repository name is required.",
            )

        if not file_path:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="GitHub file path is required.",
            )

        if not branch:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="GitHub branch is required.",
            )

        if not commit_message:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="GitHub commit message is required.",
            )

        encoded_content = base64.b64encode(
            content.encode("utf-8")
        ).decode("utf-8")

        file_url = (
            f"{self.GITHUB_API_URL}/repos/"
            f"{repository_owner}/"
            f"{repository_name}/"
            f"contents/{file_path}"
        )

        existing_file = requests.get(
            file_url,
            headers=self._headers(user_access_token),
            params={"ref": branch},
            timeout=15,
        )

        payload = {
            "message": commit_message,
            "content": encoded_content,
            "branch": branch,
        }

        if existing_file.status_code == 200:
            existing_data = existing_file.json()
            sha = existing_data.get("sha")

            if sha:
                payload["sha"] = sha

        elif existing_file.status_code != 404:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="GitHub file lookup failed.",
            )

        response = requests.put(
            file_url,
            headers=self._headers(user_access_token),
            json=payload,
            timeout=15,
        )

        if response.status_code not in {200, 201}:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=(
                    "GitHub framework file upload failed."
                ),
            )

        return response.json()

    # ------------------------------------------------------------------
    # GitHub Actions
    # ------------------------------------------------------------------

    def get_actions_public_key(
        self,
        user_access_token: str,
        repository_owner: str,
        repository_name: str,
    ) -> dict:
        """
        Get the repository public key used by GitHub to encrypt
        GitHub Actions secrets.
        """
        if not user_access_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="GitHub user access token is required.",
            )
    
        if not repository_owner or not repository_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="GitHub repository information is required.",
            )
    
        response = requests.get(
            f"{self.GITHUB_API_URL}/repos/"
            f"{repository_owner}/"
            f"{repository_name}/actions/secrets/public-key",
            headers=self._headers(user_access_token),
            timeout=15,
        )
    
        if response.status_code == 404:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="GitHub Actions public key could not be found.",
            )
    
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="GitHub Actions public key lookup failed.",
            )
    
        data = response.json()
    
        if not data.get("key") or not data.get("key_id"):
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="GitHub did not return a valid Actions public key.",
            )
    
        return data

    def create_or_update_actions_secret(
        self,
        user_access_token: str,
        repository_owner: str,
        repository_name: str,
        secret_name: str,
        encrypted_value: str,
        key_id: str,
    ) -> dict:
        """
        Create or update a GitHub Actions repository secret.

        encrypted_value must already be encrypted using the
        repository's Actions public key.
        """
        if not user_access_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="GitHub user access token is required.",
            )

        if not repository_owner or not repository_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="GitHub repository information is required.",
            )

        if not secret_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="GitHub Actions secret name is required.",
            )

        if not encrypted_value:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Encrypted secret value is required.",
            )

        if not key_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="GitHub Actions public key ID is required.",
            )

        response = requests.put(
            f"{self.GITHUB_API_URL}/repos/"
            f"{repository_owner}/"
            f"{repository_name}/actions/secrets/"
            f"{secret_name}",
            headers=self._headers(user_access_token),
            json={
                "encrypted_value": encrypted_value,
                "key_id": key_id,
            },
            timeout=15,
        )

        if response.status_code not in {201, 204}:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=(
                    "GitHub Actions secret could not be "
                    "created or updated."
                ),
            )

        return {
            "secret_name": secret_name,
            "updated": True,
        }

    def dispatch_repository_event(
        self,
        user_access_token: str,
        repository_owner: str,
        repository_name: str,
        event_type: str,
        client_payload: dict | None = None,
    ) -> dict:
        """
        Trigger a GitHub repository_dispatch event.

        QABook will use this for controlled automation actions
        such as Bug Retest execution.
        """
        if not user_access_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="GitHub user access token is required.",
            )

        if not repository_owner or not repository_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="GitHub repository information is required.",
            )

        if not event_type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="GitHub event type is required.",
            )

        payload = {
            "event_type": event_type,
            "client_payload": client_payload or {},
        }

        response = requests.post(
            f"{self.GITHUB_API_URL}/repos/"
            f"{repository_owner}/"
            f"{repository_name}/dispatches",
            headers=self._headers(user_access_token),
            json=payload,
            timeout=15,
        )

        if response.status_code == 204:
            return {
                "triggered": True,
                "event_type": event_type,
            }

        if response.status_code == 404:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    "GitHub repository was not found or the "
                    "repository dispatch permission is unavailable."
                ),
            )

        if response.status_code == 422:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "GitHub rejected the repository dispatch request."
                ),
            )

        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="GitHub repository dispatch failed.",
        )