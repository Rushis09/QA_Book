from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.ai.scenario_service import (
    AIScenarioService,
)
from app.auth.dependencies import get_current_admin
from app.models.admin import Admin
from app.ai.schemas import (
    GenerateScenarioRequest,
    GeneratedScenario,
)
from app.db.session import get_db

router = APIRouter(
    prefix="/ai/scenarios",
    tags=["AI Scenarios"],
)


@router.post(
    "/generate",
    response_model=list[GeneratedScenario],
)
def generate_scenarios(
    request: GenerateScenarioRequest,
    db: Session = Depends(get_db),
    _: Admin = Depends(get_current_admin),
):
    service = AIScenarioService(db)

    try:
        return service.generate_scenarios(
            project_id=request.project_id,
            requirement_id=request.requirement_id,
            generate_for_all=request.generate_for_all,
            manual_description=request.manual_description,
            number_of_scenarios=request.number_of_scenarios,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )