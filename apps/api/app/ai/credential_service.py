from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.admin import Admin
from app.models.ai_credential import AICredential
from app.services.ai_credential_encryption_service import (
    AICredentialEncryptionService,
)


SUPPORTED_PROVIDER = "gemini"


class AICredentialService:
    def __init__(self, db: Session):
        self.db = db
        self.encryption_service = (
            AICredentialEncryptionService()
        )

    def save_credential(
        self,
        admin: Admin,
        provider: str,
        api_key: str,
    ) -> AICredential:
        provider = provider.strip().lower()
        api_key = api_key.strip()

        if provider != SUPPORTED_PROVIDER:
            raise HTTPException(
                status_code=400,
                detail="Unsupported AI provider.",
            )

        if not api_key:
            raise HTTPException(
                status_code=400,
                detail="API key cannot be empty.",
            )

        encrypted_api_key = (
            self.encryption_service.encrypt(
                api_key
            )
        )

        credential = (
            self.db.query(AICredential)
            .filter(
                AICredential.admin_id == admin.id,
                AICredential.provider == provider,
            )
            .first()
        )

        if credential:
            credential.encrypted_api_key = (
                encrypted_api_key
            )
        else:
            credential = AICredential(
                admin_id=admin.id,
                provider=provider,
                encrypted_api_key=encrypted_api_key,
            )

            self.db.add(credential)

        self.db.commit()
        self.db.refresh(credential)

        return credential

    def get_credential(
        self,
        admin: Admin,
        provider: str = SUPPORTED_PROVIDER,
    ) -> AICredential | None:
        provider = provider.strip().lower()

        return (
            self.db.query(AICredential)
            .filter(
                AICredential.admin_id == admin.id,
                AICredential.provider == provider,
            )
            .first()
        )

    def get_api_key(
        self,
        admin: Admin,
        provider: str = SUPPORTED_PROVIDER,
    ) -> str:
        credential = self.get_credential(
            admin=admin,
            provider=provider,
        )

        if not credential:
            raise HTTPException(
                status_code=400,
                detail=(
                    "AI API key is not configured. "
                    "Please configure your AI API key "
                    "in Settings."
                ),
            )

        return self.encryption_service.decrypt(
            credential.encrypted_api_key
        )

    def delete_credential(
        self,
        admin: Admin,
        provider: str = SUPPORTED_PROVIDER,
    ) -> None:
        credential = self.get_credential(
            admin=admin,
            provider=provider,
        )

        if not credential:
            return

        self.db.delete(credential)
        self.db.commit()