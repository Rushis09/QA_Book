from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.ai.schemas import (
    GenerateRequest,
    GenerateResponse,
    RecommendTestCasesRequest,
    RecommendTestCasesResponse,
)
from app.ai.service import AIService
from app.ai.test_suite_service import (
    AITestSuiteService,
)
from app.db.session import get_db


router = APIRouter(
    prefix="/ai",
    tags=["AI"],
)


ai_service = AIService()


@router.post(
    "/generate",
    response_model=GenerateResponse,
)
def generate(
    request: GenerateRequest,
):
    response = ai_service.generate(
        request.prompt,
    )

    return GenerateResponse(
        response=response,
    )


@router.post(
    "/recommend-test-cases",
    response_model=RecommendTestCasesResponse,
)
def recommend_test_cases(
    request: RecommendTestCasesRequest,
    db: Session = Depends(get_db),
):
    service = AITestSuiteService(db)

    try:
        response = service.recommend_test_cases(
            suite_id=request.suite_id,
            test_case_ids=request.test_case_ids,
        )

        return RecommendTestCasesResponse(
            recommended_test_case_ids=response[
                "recommended_test_case_ids"
            ],
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )