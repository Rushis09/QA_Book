from datetime import datetime

from pydantic import BaseModel, field_validator


class BugBase(BaseModel):
    execution_id: int
    title: str
    description: str | None = None
    severity: str
    priority: str
    status: str
    assigned_to: str | None = None
    reported_by: str | None = None
    environment: str | None = None
    steps_to_reproduce: str | None = None
    actual_result: str | None = None


    @field_validator("status")
    @classmethod
    def validate_status(
        cls,
        value: str,
    ) -> str:
        allowed_statuses = {
            "Open",
            "In Progress",
            "Fixed",
            "Closed",
            "Reopened",
        }

        if value not in allowed_statuses:
            raise ValueError(
                f"Status must be one of: {', '.join(sorted(allowed_statuses))}"
            )

        return value


class BugCreate(BugBase):
    pass


class BugUpdate(BugBase):
    pass

class BugExecutionTestCaseResponse(BaseModel):
    id: int
    test_case_code: str
    title: str
    priority: str
    preconditions: str | None = None
    steps: str | None = None
    expected_result: str | None = None

    class Config:
        from_attributes = True


class BugExecutionResponse(BaseModel):
    id: int
    status: str
    test_case: BugExecutionTestCaseResponse

    class Config:
        from_attributes = True

class BugResponse(BugBase):
    id: int
    bug_code: str

    execution: BugExecutionResponse

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True