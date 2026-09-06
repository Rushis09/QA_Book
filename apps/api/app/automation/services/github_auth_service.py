import os
import time
from pathlib import Path

from cryptography.hazmat.primitives import serialization
from dotenv import load_dotenv
from fastapi import HTTPException, status
from jose import jwt


DOTENV_FILE = os.getenv("DOTENV_FILE", ".env")
load_dotenv(DOTENV_FILE, override=True)


class GitHubAuthService:
    def __init__(self):
        self.app_id = os.getenv("GITHUB_APP_ID")
        self.private_key_path = os.getenv(
            "GITHUB_APP_PRIVATE_KEY_PATH"
        )

    def _load_private_key(self):
        if not self.app_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="GitHub App ID is not configured.",
            )

        if not self.private_key_path:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="GitHub App private key path is not configured.",
            )

        key_path = Path(self.private_key_path)

        if not key_path.is_file():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="GitHub App private key file was not found.",
            )

        try:
            return serialization.load_pem_private_key(
                key_path.read_bytes(),
                password=None,
            )
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="GitHub App private key could not be loaded.",
            ) from exc

    def create_app_jwt(self) -> str:
        private_key = self._load_private_key()

        now = int(time.time())

        payload = {
            "iat": now - 60,
            "exp": now + (9 * 60),
            "iss": self.app_id,
        }

        return jwt.encode(
            payload,
            private_key,
            algorithm="RS256",
        )