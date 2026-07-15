from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.schemas import (
    LoginRequest,
    TokenResponse,
)
from app.auth.service import login
from app.db.session import get_db

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


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