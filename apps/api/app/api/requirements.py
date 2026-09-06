from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_admin
from app.db.session import get_db
from app.models.admin import Admin
from app.repositories.requirement_repository import RequirementRepository
from app.schemas.requirement import (
    RequirementCreate,
    RequirementResponse,
    RequirementUpdate,
)
from app.services.requirement_service import RequirementService

router = APIRouter(
    prefix="/requirements",
    tags=["Requirements"],
)


def get_requirement_service(
    db: Session,
) -> RequirementService:
    repository = RequirementRepository(db)

    return RequirementService(
        repository=repository,
    )


@router.post(
    "/",
    response_model=RequirementResponse,
)
def create_requirement(
    requirement: RequirementCreate,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    service = get_requirement_service(db)

    try:
        return service.create(
            requirement_data=requirement,
            admin=admin,
        )

    except ValueError as ex:
        raise HTTPException(
            status_code=403,
            detail=str(ex),
        )


@router.get(
    "/",
    response_model=list[RequirementResponse],
)
def get_requirements(
    project_id: int | None = None,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    service = get_requirement_service(db)

    try:
        if project_id is not None:
            return service.get_by_project(
                project_id=project_id,
                admin=admin,
            )

        return service.get_all(
            admin=admin,
        )

    except ValueError as ex:
        raise HTTPException(
            status_code=403,
            detail=str(ex),
        )


@router.get(
    "/{requirement_id}",
    response_model=RequirementResponse,
)
def get_requirement(
    requirement_id: int,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    service = get_requirement_service(db)

    try:
        return service.get_required(
            requirement_id=requirement_id,
            admin=admin,
        )

    except ValueError as ex:
        raise HTTPException(
            status_code=404,
            detail=str(ex),
        )


@router.put(
    "/{requirement_id}",
    response_model=RequirementResponse,
)
def update_requirement(
    requirement_id: int,
    requirement_data: RequirementUpdate,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    service = get_requirement_service(db)

    try:
        requirement = service.get_required(
            requirement_id=requirement_id,
            admin=admin,
        )

        return service.update(
            requirement,
            requirement_data,
            admin=admin,
        )

    except ValueError as ex:
        raise HTTPException(
            status_code=404,
            detail=str(ex),
        )


@router.delete(
    "/{requirement_id}",
)
def delete_requirement(
    requirement_id: int,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    service = get_requirement_service(db)

    try:
        requirement = service.get_required(
            requirement_id=requirement_id,
            admin=admin,
        )

        service.delete(
            requirement,
            admin=admin,
        )

        return {
            "message": "Requirement deleted successfully",
        }

    except ValueError as ex:
        raise HTTPException(
            status_code=404,
            detail=str(ex),
        )