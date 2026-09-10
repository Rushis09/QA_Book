from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.administration.dependencies import require_platform_admin
from app.administration.schemas import (
    AdminActionResponse,
    AdminUserCreate,
    AdminUserDetailResponse,
    AdminUserPasswordReset,
    AdminUserResponse,
    AdminUserStatusUpdate,
    AdminUserUpdate,
)
from app.administration.service import (
    create_user,
    get_user,
    get_users,
    reset_user_password,
    update_user,
    update_user_status,
)
from app.auth.dependencies import get_current_admin
from app.db.session import get_db
from app.models.admin import Admin


router = APIRouter(
    prefix="/administration",
    tags=["Administration"],
    dependencies=[Depends(require_platform_admin)],
)


@router.get(
    "/users",
    response_model=list[AdminUserResponse],
)
def list_users(
    db: Session = Depends(get_db),
):
    return get_users(db=db)


@router.get(
    "/users/{user_id}",
    response_model=AdminUserDetailResponse,
)
def get_user_details(
    user_id: int,
    db: Session = Depends(get_db),
):
    admin = get_user(
        user_id=user_id,
        db=db,
    )

    return AdminUserDetailResponse(
        **admin.__dict__,
        project_count=len(admin.projects),
    )


@router.post(
    "/users",
    response_model=AdminUserResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_admin_user(
    request: AdminUserCreate,
    db: Session = Depends(get_db),
):
    return create_user(
        request=request,
        db=db,
    )


@router.patch(
    "/users/{user_id}",
    response_model=AdminUserResponse,
)
def update_admin_user(
    user_id: int,
    request: AdminUserUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    return update_user(
        user_id=user_id,
        request=request,
        db=db,
        acting_admin=current_admin,
    )


@router.patch(
    "/users/{user_id}/status",
    response_model=AdminUserResponse,
)
def update_admin_user_status(
    user_id: int,
    request: AdminUserStatusUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    return update_user_status(
        user_id=user_id,
        request=request,
        db=db,
        acting_admin=current_admin,
    )


@router.post(
    "/users/{user_id}/reset-password",
    response_model=AdminActionResponse,
)
def reset_admin_user_password(
    user_id: int,
    request: AdminUserPasswordReset,
    db: Session = Depends(get_db),
):
    reset_user_password(
        user_id=user_id,
        request=request,
        db=db,
    )

    return {
        "message": "User password reset successfully.",
    }