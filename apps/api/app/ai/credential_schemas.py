from pydantic import BaseModel, Field


class AICredentialSaveRequest(BaseModel):
    provider: str = Field(
        default="gemini",
        min_length=1,
        max_length=50,
    )

    api_key: str = Field(
        min_length=1,
        max_length=1000,
    )


class AICredentialStatusResponse(BaseModel):
    provider: str
    configured: bool


class AICredentialTestResponse(BaseModel):
    provider: str
    connected: bool
    message: str