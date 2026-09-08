import hashlib
import os
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth.email_service import send_email
from app.auth.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.models.admin import Admin
from app.models.password_reset_token import PasswordResetToken


PASSWORD_RESET_TOKEN_EXPIRY_MINUTES = 30


def register(
    username: str,
    email: str,
    password: str,
    db: Session,
):
    username = username.strip()
    email = email.strip().lower()

    existing_username = (
        db.query(Admin)
        .filter(Admin.username == username)
        .first()
    )

    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists.",
        )

    existing_email = (
        db.query(Admin)
        .filter(Admin.email == email)
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already exists.",
        )

    admin = Admin(
        username=username,
        email=email,
        password_hash=hash_password(password),
        is_active=True,
        role="USER",
    )

    try:
        db.add(admin)
        db.commit()
        db.refresh(admin)
    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username or email already exists.",
        )

    return admin


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
            "sub": str(admin.id),
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }

def change_password(
    admin: Admin,
    current_password: str,
    new_password: str,
    db: Session,
):
    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account is inactive.",
        )

    if not verify_password(
        current_password,
        admin.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )

    if current_password == new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from the current password.",
        )

    admin.password_hash = hash_password(new_password)

    try:
        db.commit()
        db.refresh(admin)
    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to change password.",
        )

    return admin

def create_password_reset_token(
    email: str,
    db: Session,
):
    email = email.strip().lower()

    admin = (
        db.query(Admin)
        .filter(Admin.email == email)
        .first()
    )

    # Always return the same result whether the email exists or not.
    # This prevents account/email enumeration.
    if not admin or not admin.is_active:
        return None

    # Invalidate any previous unused reset tokens.
    existing_tokens = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.admin_id == admin.id,
            PasswordResetToken.used_at.is_(None),
        )
        .all()
    )

    now = datetime.now(timezone.utc)

    for reset_token in existing_tokens:
        reset_token.used_at = now

    # Generate the raw token that will be sent by email.
    raw_token = secrets.token_urlsafe(48)

    token_hash = hashlib.sha256(
        raw_token.encode("utf-8")
    ).hexdigest()

    reset_token = PasswordResetToken(
        admin_id=admin.id,
        token_hash=token_hash,
        expires_at=now
        + timedelta(
            minutes=PASSWORD_RESET_TOKEN_EXPIRY_MINUTES
        ),
    )

    try:
        db.add(reset_token)
        db.commit()
        db.refresh(reset_token)
    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create password reset request.",
        )

    return {
        "admin": admin,
        "token": raw_token,
        "expires_at": reset_token.expires_at,
    }


def send_password_reset_email(
    email: str,
    db: Session,
):
    reset_request = create_password_reset_token(
        email=email,
        db=db,
    )

    # Do not reveal whether the email exists.
    if not reset_request:
        return

    frontend_base_url = os.getenv(
        "FRONTEND_BASE_URL",
        "http://localhost:5173",
    ).rstrip("/")

    reset_link = (
        f"{frontend_base_url}/reset-password"
        f"?token={reset_request['token']}"
    )

    subject = "Reset your QABook password"

    body = f"""Hello {reset_request["admin"].username},

We received a request to reset your QABook password.

Use the link below to create a new password:

{reset_link}

This link will expire in {PASSWORD_RESET_TOKEN_EXPIRY_MINUTES} minutes.

If you did not request a password reset, you can safely ignore this email.

Regards,
QABook
"""

    send_email(
        to_email=reset_request["admin"].email,
        subject=subject,
        body=body,
    )


def reset_password(
    token: str,
    new_password: str,
    db: Session,
):
    token_hash = hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()

    reset_token = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.token_hash == token_hash
        )
        .first()
    )

    if not reset_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token.",
        )

    now = datetime.now(timezone.utc)

    if reset_token.used_at is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token.",
        )

    expires_at = reset_token.expires_at

    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(
            tzinfo=timezone.utc
        )

    if expires_at <= now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token.",
        )

    admin = (
        db.query(Admin)
        .filter(Admin.id == reset_token.admin_id)
        .first()
    )

    if not admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token.",
        )

    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account is inactive.",
        )

    admin.password_hash = hash_password(new_password)
    reset_token.used_at = now

    # Invalidate any other unused tokens for the same account.
    other_tokens = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.admin_id == admin.id,
            PasswordResetToken.id != reset_token.id,
            PasswordResetToken.used_at.is_(None),
        )
        .all()
    )

    for other_token in other_tokens:
        other_token.used_at = now

    try:
        db.commit()
    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to reset password.",
        )

    return admin