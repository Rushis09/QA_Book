import secrets
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.automation.models.github_oauth_state import GitHubOAuthState


STATE_EXPIRY_MINUTES = 10


class GitHubOAuthStateService:
    def __init__(self, db: Session):
        self.db = db

    def create_state(
        self,
        admin_id: int,
        automation_project_id: int,
    ) -> str:
        state = secrets.token_urlsafe(64)

        expires_at = datetime.now(timezone.utc) + timedelta(
            minutes=STATE_EXPIRY_MINUTES
        )

        oauth_state = GitHubOAuthState(
            state=state,
            admin_id=admin_id,
            automation_project_id=automation_project_id,
            expires_at=expires_at,
        )

        self.db.add(oauth_state)
        self.db.commit()

        return state

    def consume_state(
        self,
        state: str,
    ) -> GitHubOAuthState:
        oauth_state = (
            self.db.query(GitHubOAuthState)
            .filter(
                GitHubOAuthState.state == state
            )
            .first()
        )

        if not oauth_state:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired GitHub authorization state.",
            )

        now = datetime.now(timezone.utc)

        expires_at = oauth_state.expires_at

        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(
                tzinfo=timezone.utc
            )

        if expires_at <= now:
            self.db.delete(oauth_state)
            self.db.commit()

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="GitHub authorization state has expired.",
            )

        self.db.delete(oauth_state)
        self.db.commit()

        return oauth_state