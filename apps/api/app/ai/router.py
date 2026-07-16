from fastapi import APIRouter

from app.ai.schemas import (
    GenerateRequest,
    GenerateResponse,
)
from app.ai.service import AIService

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