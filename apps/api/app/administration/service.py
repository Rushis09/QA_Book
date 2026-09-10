from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth.security import hash_password
from app.administration.schemas import (
    AdminUserCreate,
    AdminUserPasswordReset,
    AdminUserStatusUpdate,
    AdminUserUpdate,
)
from app.models.admin import Admin


def get_users(
    db: Session,
):
    return (
        db.query(Admin)
        .order_by(Admin.created_at.desc(), Admin.id.desc())
        .all()
    )


def get_user(
    user_id: int,
    db: Session,
):
    admin = (
        db.query(Admin)
        .filter(Admin.id == user_id)
        .first()
    )

    if admin is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    return admin


def get_active_platform_admin_count(
    db: Session,
) -> int:
    return (
        db.query(Admin)
        .filter(
            Admin.role == "PLATFORM_ADMIN",
            Admin.is_active.is_(True),
        )
        .count()
    )


def ensure_platform_admin_safety(
    admin: Admin,
    db: Session,
    *,
    acting_admin: Admin | None = None,
    new_role: str | None = None,
    new_is_active: bool | None = None,
):
    current_role = admin.role
    current_is_active = admin.is_active

    resulting_role = (
        new_role
        if new_role is not None
        else current_role
    )

    resulting_is_active = (
        new_is_active
        if new_is_active is not None
        else current_is_active
    )

    # Prevent the currently authenticated Platform Admin
    # from removing their own Platform Admin access.
    if acting_admin is not None and admin.id == acting_admin.id:
        if (
            new_role is not None
            and new_role != "PLATFORM_ADMIN"
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You cannot remove your own Platform Admin role.",
            )

        if new_is_active is False:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You are Admin you can't deactivate your own account"
            )

    currently_active_platform_admin = (
        current_role == "PLATFORM_ADMIN"
        and current_is_active
    )

    will_remain_active_platform_admin = (
        resulting_role == "PLATFORM_ADMIN"
        and resulting_is_active
    )

    # Always keep at least one active Platform Admin.
    if (
        currently_active_platform_admin
        and not will_remain_active_platform_admin
    ):
        active_platform_admin_count = (
            get_active_platform_admin_count(db)
        )

        if active_platform_admin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "The last active Platform Admin "
                    "cannot be deactivated or have "
                    "their role changed."
                ),
            )


def create_user(
    request: AdminUserCreate,
    db: Session,
):
    username = request.username.strip()
    email = str(request.email).strip().lower()
    role = request.role.strip().upper()

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
        password_hash=hash_password(request.password),
        role=role,
        is_active=True,
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


def update_user(
    user_id: int,
    request: AdminUserUpdate,
    db: Session,
    acting_admin: Admin | None = None,
):
    admin = get_user(
        user_id=user_id,
        db=db,
    )

    requested_role = (
        request.role.strip().upper()
        if request.role is not None
        else None
    )

    ensure_platform_admin_safety(
        admin=admin,
        db=db,
        acting_admin=acting_admin,
        new_role=requested_role,
    )

    if request.username is not None:
        username = request.username.strip()

        existing_username = (
            db.query(Admin)
            .filter(
                Admin.username == username,
                Admin.id != user_id,
            )
            .first()
        )

        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already exists.",
            )

        admin.username = username

    if request.email is not None:
        email = str(request.email).strip().lower()

        existing_email = (
            db.query(Admin)
            .filter(
                Admin.email == email,
                Admin.id != user_id,
            )
            .first()
        )

        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already exists.",
            )

        admin.email = email

    if requested_role is not None:
        admin.role = requested_role

    try:
        db.commit()
        db.refresh(admin)
    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username or email already exists.",
        )

    return admin


def update_user_status(
    user_id: int,
    request: AdminUserStatusUpdate,
    db: Session,
    acting_admin: Admin | None = None,
):
    admin = get_user(
        user_id=user_id,
        db=db,
    )

    ensure_platform_admin_safety(
        admin=admin,
        db=db,
        acting_admin=acting_admin,
        new_is_active=request.is_active,
    )

    admin.is_active = request.is_active

    try:
        db.commit()
        db.refresh(admin)
    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to update user status.",
        )

    return admin


def reset_user_password(
    user_id: int,
    request: AdminUserPasswordReset,
    db: Session,
):
    admin = get_user(
        user_id=user_id,
        db=db,
    )

    admin.password_hash = hash_password(
        request.new_password,
    )

    try:
        db.commit()
        db.refresh(admin)
    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to reset user password.",
        )

    return admin