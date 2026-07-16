from pydantic import BaseModel


class GenerateRequest(BaseModel):
    prompt: str


class GenerateResponse(BaseModel):
    response: str


class GenerateRequirementRequest(BaseModel):
    project_id: int
    manual_description: str = ""
    number_of_requirements: int


from pydantic import BaseModel, Field


class GeneratedRequirement(BaseModel):
    module: str = Field(
        min_length=1,
    )

    priority: str = Field(
        pattern="^(High|Medium|Low)$",
    )

    description: str = Field(
        min_length=5,
    )

class GenerateScenarioRequest(BaseModel):
    project_id: int
    requirement_id: int | None = None
    generate_for_all: bool = False
    manual_description: str = ""
    number_of_scenarios: int


class GeneratedScenario(BaseModel):
    title: str = Field(
        min_length=3,
    )

    priority: str = Field(
        pattern="^(High|Medium|Low)$",
    )

    status: str = Field(
        pattern="^(Draft)$",
    )

    description: str = Field(
        min_length=5,
    )