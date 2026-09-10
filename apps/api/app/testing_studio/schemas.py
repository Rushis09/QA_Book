from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from app.testing_studio.constants import ExecutionMethod, TestingType


class StepItem(BaseModel):
    step_no: int = Field(ge=1)
    action: str = Field(min_length=1, max_length=2000)
    test_data: str = Field(default="", max_length=2000)
    expected_result: str = Field(default="", max_length=2000)


class ExpectedColumn(BaseModel):
    column: str = Field(min_length=1, max_length=255)
    expected_value: str = Field(default="", max_length=2000)


class AuditFlags(BaseModel):
    alt_text: bool = False
    contrast_ratio: bool = False
    tab_order: bool = False
    keyboard_access: bool = False
    labels: bool = False




class TestingProfileCreate(BaseModel):
    testing_type: TestingType
    execution_method: ExecutionMethod = ExecutionMethod.MANUAL
    meta_attributes: dict[str, Any] = Field(default_factory=dict)


class TestingProfileUpdate(BaseModel):
    testing_type: TestingType
    execution_method: ExecutionMethod = ExecutionMethod.MANUAL
    meta_attributes: dict[str, Any] = Field(default_factory=dict)


class TestingProfileResponse(TestingProfileCreate):
    id: int
    test_case_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class StudioTestCaseCreate(BaseModel):
    scenario_id: int
    module: str = Field(min_length=1, max_length=100)
    priority: str = Field(default="Medium", max_length=20)
    status: str = Field(default="Draft", max_length=20)
    title: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=1000)
    preconditions: str | None = Field(default=None, max_length=2000)
    test_data: str | None = Field(default=None, max_length=2000)
    steps: str | None = Field(default=None, max_length=5000)
    expected_result: str | None = Field(default=None, max_length=2000)
    automation_eligibility: str = "Eligible"
    automation_status: str = "Not Automated"
    profile: TestingProfileCreate


class StudioTestCaseUpdate(StudioTestCaseCreate):
    pass


class StudioTestCaseResponse(BaseModel):
    id: int
    test_case_code: str
    scenario_id: int
    module: str
    priority: str
    status: str
    automation_eligibility: str
    automation_status: str
    title: str
    description: str | None
    preconditions: str | None
    test_data: str | None
    steps: str | None
    expected_result: str | None
    profile: TestingProfileResponse
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


def validate_definition(testing_type: TestingType, attrs: dict[str, Any]) -> dict[str, Any]:
    """Strict enough to catch malformed payloads without locking us into a DB schema."""
    if not isinstance(attrs, dict):
        raise ValueError("meta_attributes must be an object")

    required = {
        TestingType.FUNCTIONAL: ("steps",),
        TestingType.API: ("endpoint_url", "http_method"),
        TestingType.DATABASE: ("target_database", "table_name", "verification_sql"),
        TestingType.AUTOMATION: ("framework", "script_identifier"),
        TestingType.PERFORMANCE: ("tool", "virtual_users", "ramp_up_seconds", "duration_seconds"),
        TestingType.SECURITY: ("vulnerability_category", "target_vector", "attack_payload"),
        TestingType.ACCESSIBILITY: ("wcag_clause", "assistive_technology", "audit_flags"),
    }[testing_type]

    missing = [key for key in required if key not in attrs]
    if missing:
        raise ValueError(f"Missing required {testing_type.value} fields: {', '.join(missing)}")

    if testing_type == TestingType.FUNCTIONAL:
        if not isinstance(attrs["steps"], list):
            raise ValueError("Functional steps must be an array")
        attrs["steps"] = [StepItem.model_validate(item).model_dump() for item in attrs["steps"]]
    elif testing_type == TestingType.DATABASE:
        if not isinstance(attrs.get("expected_columns", []), list):
            raise ValueError("expected_columns must be an array")
        attrs["expected_columns"] = [ExpectedColumn.model_validate(item).model_dump() for item in attrs.get("expected_columns", [])]
    elif testing_type == TestingType.ACCESSIBILITY:
        attrs["audit_flags"] = AuditFlags.model_validate(attrs["audit_flags"]).model_dump()
    elif testing_type == TestingType.PERFORMANCE:
        for key in ("virtual_users", "ramp_up_seconds", "duration_seconds"):
            try:
                attrs[key] = int(attrs[key])
            except (TypeError, ValueError):
                raise ValueError(f"{key} must be an integer")
            if attrs[key] < 0:
                raise ValueError(f"{key} cannot be negative")
        benchmarks = attrs.get("sla_benchmarks", {})
        if not isinstance(benchmarks, dict):
            raise ValueError("sla_benchmarks must be an object")
    elif testing_type == TestingType.API:
        method = str(attrs["http_method"]).upper()
        if method not in {"GET", "POST", "PUT", "DELETE", "PATCH"}:
            raise ValueError("Unsupported HTTP method")
        attrs["http_method"] = method
    return attrs
