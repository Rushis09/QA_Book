from pydantic import BaseModel, Field


class GenerateRequest(BaseModel):
    prompt: str


class GenerateResponse(BaseModel):
    response: str


# ============================================================
# Requirement Generation
# ============================================================


class GenerateRequirementRequest(BaseModel):
    project_id: int
    manual_description: str = ""
    number_of_requirements: int = Field(
        ge=1,
        le=20,
    )


class GenerateRequirementsFromBRDRequest(BaseModel):
    project_id: int
    document_id: int
    number_of_requirements: int = Field(
        ge=1,
        le=20,
    )


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


# ============================================================
# Scenario Generation
# ============================================================


class GenerateScenarioRequest(BaseModel):
    project_id: int
    requirement_id: int | None = None
    generate_for_all: bool = False
    manual_description: str = ""
    number_of_scenarios: int = Field(
        ge=1,
        le=15,
    )


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


# ============================================================
# Bulk Scenario Generation
# ============================================================


class BulkScenarioGenerationRequest(BaseModel):
    project_id: int

    requirement_ids: list[int] = Field(
        min_length=1,
        max_length=100,
    )

    manual_description: str = ""

    number_of_scenarios: int = Field(
        ge=1,
        le=15,
    )


class BulkScenarioSource(BaseModel):
    requirement_id: int
    requirement_code: str
    requirement_module: str
    requirement_description: str


class BulkScenarioCandidate(BaseModel):
    source_requirement_id: int
    source_requirement_code: str

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


class BulkScenarioResult(BaseModel):
    requirement_id: int
    requirement_code: str
    scenarios: list[BulkScenarioCandidate] = Field(
        default_factory=list,
    )

    validation_warnings: list[str] = Field(
        default_factory=list,
    )


class BulkScenarioGenerationResponse(BaseModel):
    project_id: int
    requested_requirement_count: int
    processed_requirement_count: int

    results: list[BulkScenarioResult] = Field(
        default_factory=list,
    )

    errors: list[str] = Field(
        default_factory=list,
    )


# ============================================================
# Test Case Generation
# ============================================================

from typing import Any

from app.testing_studio.constants import ExecutionMethod, TestingType


class GenerateTestCaseRequest(BaseModel):
    scenario_id: int
    manual_description: str = ""
    number_of_test_cases: int = Field(
        ge=1,
        le=15,
    )
    testing_types: list[TestingType] = Field(
        default_factory=lambda: [TestingType.FUNCTIONAL],
        min_length=1,
        max_length=6,
    )


class GeneratedTestCase(BaseModel):
    testing_type: TestingType = TestingType.FUNCTIONAL
    execution_method: ExecutionMethod = ExecutionMethod.MANUAL

    title: str = Field(
        min_length=3,
    )

    priority: str = Field(
        pattern="^(High|Medium|Low)$",
    )

    description: str = Field(
        default="",
        max_length=2000,
    )

    preconditions: str = Field(
        min_length=3,
    )

    test_data: str = Field(
        min_length=1,
    )

    steps: str = Field(
        min_length=5,
    )

    expected_result: str = Field(
        min_length=5,
    )

    meta_attributes: dict[str, Any] = Field(
        default_factory=dict,
    )


# ============================================================
# Bulk Test Case Generation
# ============================================================


class BulkTestCaseGenerationRequest(BaseModel):
    scenario_ids: list[int] = Field(
        min_length=1,
        max_length=100,
    )

    manual_description: str = ""

    number_of_test_cases: int = Field(
        ge=1,
        le=15,
    )

    testing_types: list[TestingType] = Field(
        default_factory=lambda: [TestingType.FUNCTIONAL],
        min_length=1,
        max_length=6,
    )


class BulkTestCaseSource(BaseModel):
    scenario_id: int
    scenario_code: str
    module: str
    scenario_title: str
    scenario_description: str


class BulkTestCaseCandidate(BaseModel):
    source_scenario_id: int
    source_scenario_code: str

    testing_type: TestingType = TestingType.FUNCTIONAL
    execution_method: ExecutionMethod = ExecutionMethod.MANUAL

    title: str = Field(
        min_length=3,
    )

    priority: str = Field(
        pattern="^(High|Medium|Low)$",
    )

    description: str = Field(
        default="",
        max_length=2000,
    )

    preconditions: str = Field(
        min_length=3,
    )

    test_data: str = Field(
        min_length=1,
    )

    steps: str = Field(
        min_length=5,
    )

    expected_result: str = Field(
        min_length=5,
    )

    meta_attributes: dict[str, Any] = Field(
        default_factory=dict,
    )


class BulkTestCaseResult(BaseModel):
    scenario_id: int
    scenario_code: str

    test_cases: list[BulkTestCaseCandidate] = Field(
        default_factory=list,
    )

    validation_warnings: list[str] = Field(
        default_factory=list,
    )


class BulkTestCaseGenerationResponse(BaseModel):
    requested_scenario_count: int
    processed_scenario_count: int

    results: list[BulkTestCaseResult] = Field(
        default_factory=list,
    )

    errors: list[str] = Field(
        default_factory=list,
    )

# ============================================================
# Test Suite AI Recommendation
# ============================================================


class RecommendTestCasesRequest(BaseModel):
    suite_id: int
    test_case_ids: list[int]


class RecommendTestCasesResponse(BaseModel):
    recommended_test_case_ids: list[int]