from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.bug import (
    BugCreate,
    BugResponse,
    BugUpdate,
)
from app.services.bug_service import (
    BugService,
)

router = APIRouter(
    prefix="/bugs",
    tags=["Bugs"],
)

@router.post(
    "/",
    response_model=BugResponse,
)
def create_bug(
    bug: BugCreate,
    db: Session = Depends(get_db),
):
    service = BugService(db)

    return service.create_bug(
        bug,
    )

@router.get(
    "/",
    response_model=list[BugResponse],
)
def get_bugs(
    db: Session = Depends(get_db),
):
    service = BugService(db)

    return service.get_bugs()

@router.get(
    "/{bug_id}",
    response_model=BugResponse,
)
def get_bug(
    bug_id: int,
    db: Session = Depends(get_db),
):
    service = BugService(db)

    return service.get_bug(
        bug_id,
    )

@router.put(
    "/{bug_id}",
    response_model=BugResponse,
)
def update_bug(
    bug_id: int,
    bug: BugUpdate,
    db: Session = Depends(get_db),
):
    service = BugService(db)

    return service.update_bug(
        bug_id,
        bug,
    )

@router.delete(
    "/{bug_id}",
)
def delete_bug(
    bug_id: int,
    db: Session = Depends(get_db),
):
    service = BugService(db)

    service.delete_bug(
        bug_id,
    )

    return {
        "message": "Bug deleted successfully",
    }