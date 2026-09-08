from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_admin
from app.auth.schemas import (
    AccountResponse,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    WorkspaceUserResponse,
)
from app.auth.service import (
    change_password,
    login,
    register,
    reset_password,
    send_password_reset_email,
)
from app.db.session import get_db
from app.models.admin import Admin
from fastapi import APIRouter, Depends, HTTPException


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
)
def register_admin(
    request: RegisterRequest,
    db: Session = Depends(get_db),
):
    admin = register(
        username=request.username,
        email=str(request.email),
        password=request.password,
        db=db,
    )

    return {
        "message": "Account created successfully.",
        "username": admin.username,
    }


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login_admin(
    request: LoginRequest,
    db: Session = Depends(get_db),
):
    return login(
        username=request.username,
        password=request.password,
        db=db,
    )


@router.post(
    "/change-password",
)
def change_password_admin(
    request: ChangePasswordRequest,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    change_password(
        admin=admin,
        current_password=request.current_password,
        new_password=request.new_password,
        db=db,
    )

    return {
        "message": "Password changed successfully.",
    }

@router.post(
    "/forgot-password",
)
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    send_password_reset_email(
        email=str(request.email),
        db=db,
    )

    # Keep the response identical whether the email exists or not.
    return {
        "message": (
            "If an account exists for this email, "
            "password reset instructions have been sent."
        )
    }


@router.post(
    "/reset-password",
)
def reset_password_admin(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    reset_password(
        token=request.token,
        new_password=request.new_password,
        db=db,
    )

    return {
        "message": "Password reset successfully.",
    }


@router.get(
    "/me",
    response_model=AccountResponse,
)
def get_my_account(
    admin: Admin = Depends(get_current_admin),
):
    return admin

@router.get(
    "/workspace-users",
    response_model=list[WorkspaceUserResponse],
)
def get_workspace_users(
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    if admin.role != "PLATFORM_ADMIN":
        raise HTTPException(
            status_code=403,
            detail="Platform Admin access required.",
        )

    return (
        db.query(Admin)
        .filter(Admin.is_active.is_(True))
        .order_by(Admin.username)
        .all()
    )