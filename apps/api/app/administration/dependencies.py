from fastapi import Depends, HTTPException, status

from app.auth.dependencies import get_current_admin
from app.models.admin import Admin


def require_platform_admin(
    admin: Admin = Depends(get_current_admin),
) -> Admin:
    if admin.role != "PLATFORM_ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Platform Admin access required.",
        )

    return admin