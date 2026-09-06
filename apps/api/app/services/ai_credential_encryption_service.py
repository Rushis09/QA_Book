import os

from cryptography.fernet import Fernet, InvalidToken
from fastapi import HTTPException, status


class AICredentialEncryptionService:
    def __init__(self):
        encryption_key = os.getenv(
            "AI_CREDENTIAL_ENCRYPTION_KEY"
        )

        if not encryption_key:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "AI credential encryption key "
                    "is not configured."
                ),
            )

        try:
            self.fernet = Fernet(
                encryption_key.encode("utf-8")
            )
        except Exception as error:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "AI credential encryption key "
                    "is invalid."
                ),
            ) from error

    def encrypt(
        self,
        api_key: str,
    ) -> str:
        if not api_key:
            raise ValueError(
                "API key cannot be empty."
            )

        encrypted = self.fernet.encrypt(
            api_key.encode("utf-8")
        )

        return encrypted.decode("utf-8")

    def decrypt(
        self,
        encrypted_api_key: str,
    ) -> str:
        try:
            decrypted = self.fernet.decrypt(
                encrypted_api_key.encode("utf-8")
            )

            return decrypted.decode("utf-8")

        except InvalidToken as error:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "AI credential could not be decrypted."
                ),
            ) from error