from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ---------------------------------------------------------------------------
# User list / detail
# ---------------------------------------------------------------------------

class AdminUserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminUserDetailResponse(AdminUserResponse):
    project_count: int = 0


# ---------------------------------------------------------------------------
# Create user
# ---------------------------------------------------------------------------

class AdminUserCreate(BaseModel):
    username: str = Field(
        min_length=3,
        max_length=100,
    )

    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=128,
    )

    role: str = Field(
        default="USER",
        min_length=1,
        max_length=30,
    )


# ---------------------------------------------------------------------------
# Update user
# ---------------------------------------------------------------------------

class AdminUserUpdate(BaseModel):
    username: str | None = Field(
        default=None,
        min_length=3,
        max_length=100,
    )

    email: EmailStr | None = None

    role: str | None = Field(
        default=None,
        min_length=1,
        max_length=30,
    )


# ---------------------------------------------------------------------------
# Account status
# ---------------------------------------------------------------------------

class AdminUserStatusUpdate(BaseModel):
    is_active: bool


# ---------------------------------------------------------------------------
# Administrator password reset
# ---------------------------------------------------------------------------

class AdminUserPasswordReset(BaseModel):
    new_password: str = Field(
        min_length=8,
        max_length=128,
    )


# ---------------------------------------------------------------------------
# Generic administration action response
# ---------------------------------------------------------------------------

class AdminActionResponse(BaseModel):
    message: str