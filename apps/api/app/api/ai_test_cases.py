from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.ai.test_case_service import (
    AITestCaseService,
)
from app.auth.dependencies import get_current_admin
from app.models.admin import Admin
from app.ai.schemas import (
    GenerateTestCaseRequest,
    GeneratedTestCase,
)
from app.db.session import get_db

router = APIRouter(
    prefix="/ai/test-cases",
    tags=["AI Test Cases"],
)


@router.post(
    "/generate",
    response_model=list[GeneratedTestCase],
)
def generate_test_cases(
    request: GenerateTestCaseRequest,
    db: Session = Depends(get_db),
    _: Admin = Depends(get_current_admin),
):
    service = AITestCaseService(db)

    try:
        return service.generate_test_cases(
            scenario_id=request.scenario_id,
            manual_description=request.manual_description,
            number_of_test_cases=request.number_of_test_cases,
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )