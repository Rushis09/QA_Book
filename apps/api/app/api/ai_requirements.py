from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.ai.requirement_service import (
    AIRequirementService,
)
from app.auth.dependencies import get_current_admin
from app.models.admin import Admin
from app.ai.schemas import (
    GenerateRequirementRequest,
    GeneratedRequirement,
)
from app.db.session import get_db

router = APIRouter(
    prefix="/ai/requirements",
    tags=["AI Requirements"],
)


@router.post(
    "/generate",
    response_model=list[GeneratedRequirement],
)
def generate_requirements(
    request: GenerateRequirementRequest,
    db: Session = Depends(get_db),
    _: Admin = Depends(get_current_admin),
):
    service = AIRequirementService(db)

    try:
        return service.generate_requirements(
            project_id=request.project_id,
            manual_description=request.manual_description,
            number_of_requirements=request.number_of_requirements,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )