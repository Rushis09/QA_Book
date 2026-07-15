from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.auth.security import (
    create_access_token,
    verify_password,
)
from app.models.admin import Admin


def login(
    username: str,
    password: str,
    db: Session,
):
    admin = (
        db.query(Admin)
        .filter(Admin.username == username)
        .first()
    )

    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account is inactive",
        )

    if not verify_password(
        password,
        admin.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    token = create_access_token(
        {
            "sub": admin.username,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }