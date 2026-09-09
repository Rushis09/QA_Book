from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.ai.credential_schemas import (
    AICredentialSaveRequest,
    AICredentialStatusResponse,
    AICredentialTestResponse,
)
from app.ai.schemas import (
    BulkScenarioGenerationRequest,
    BulkScenarioGenerationResponse,
    BulkTestCaseGenerationRequest,
    BulkTestCaseGenerationResponse,
    GenerateRequest,
    GenerateResponse,
    RecommendTestCasesRequest,
    RecommendTestCasesResponse,
)
from app.ai.test_case_service import (
    AITestCaseService,
)
from app.ai.service import AIService
from app.ai.test_suite_service import (
    AITestSuiteService,
)
from app.auth.dependencies import get_current_admin
from app.db.session import get_db
from app.models.admin import Admin
from app.ai.credential_service import (
    AICredentialService,
)
from app.ai.scenario_service import (
    AIScenarioService,
)

router = APIRouter(
    prefix="/ai",
    tags=["AI"],
)





@router.post(
    "/generate",
    response_model=GenerateResponse,
)
def generate(
    request: GenerateRequest,
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    credential_service = AICredentialService(db)

    api_key = credential_service.get_api_key(
        admin=admin,
    )

    ai_service = AIService(
        api_key=api_key,
    )

    try:
        response = ai_service.generate(
            request.prompt,
        )

        return GenerateResponse(
            response=response,
        )

    except RuntimeError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    
@router.post(
    "/generate-scenarios-bulk",
    response_model=BulkScenarioGenerationResponse,
)
def generate_scenarios_bulk(
    request: BulkScenarioGenerationRequest,
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    service = AIScenarioService(
        db=db,
        admin=admin,
    )

    try:
        return service.generate_scenarios_bulk(
            project_id=request.project_id,
            requirement_ids=request.requirement_ids,
            manual_description=(
                request.manual_description
            ),
            number_of_scenarios=(
                request.number_of_scenarios
            ),
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except RuntimeError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


@router.post(
    "/generate-test-cases-bulk",
    response_model=BulkTestCaseGenerationResponse,
)
def generate_test_cases_bulk(
    request: BulkTestCaseGenerationRequest,
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    service = AITestCaseService(
        db=db,
        admin=admin,
    )

    try:
        return service.generate_test_cases_bulk(
            scenario_ids=request.scenario_ids,
            manual_description=(
                request.manual_description
            ),
            number_of_test_cases=(
                request.number_of_test_cases
            ),
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except RuntimeError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

@router.post(
    "/recommend-test-cases",
    response_model=RecommendTestCasesResponse,
)
def recommend_test_cases(
    request: RecommendTestCasesRequest,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    service = AITestSuiteService(
        db=db,
        admin=admin,
    )

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


@router.get(
    "/credentials",
    response_model=AICredentialStatusResponse,
)
def get_ai_credential_status(
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    service = AICredentialService(db)

    credential = service.get_credential(
        admin=admin,
    )

    return AICredentialStatusResponse(
        provider="gemini",
        configured=credential is not None,
    )


@router.post(
    "/credentials",
)
def save_ai_credential(
    request: AICredentialSaveRequest,
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    service = AICredentialService(db)

    service.save_credential(
        admin=admin,
        provider=request.provider,
        api_key=request.api_key,
    )

    return {
        "message": "AI API key saved successfully.",
        "provider": request.provider.strip().lower(),
    }


@router.post(
    "/credentials/test",
    response_model=AICredentialTestResponse,
)
def test_ai_credential(
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    service = AICredentialService(db)

    try:
        api_key = service.get_api_key(
            admin=admin,
        )

        test_service = AIService(
            api_key=api_key,
        )

        test_service.generate(
            "Reply with exactly: QABook AI connection successful"
        )

        return AICredentialTestResponse(
            provider="gemini",
            connected=True,
            message="Gemini API connection successful.",
        )

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=f"Gemini API connection failed: {error}",
        )


@router.delete(
    "/credentials",
)
def delete_ai_credential(
    admin: Admin = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    service = AICredentialService(db)

    service.delete_credential(
        admin=admin,
    )

    return {
        "message": "AI API key removed successfully.",
    }