from datetime import datetime

from pydantic import (
    BaseModel,
    field_validator,
    model_validator,
)


class BugBase(BaseModel):
    execution_id: int
    title: str
    description: str | None = None
    severity: str
    priority: str
    status: str
    resolution: str | None = None
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
            "Triaged",
            "In Progress",
            "Fixed",
            "Ready for QA",
            "Retesting",
            "Closed",
            "Reopened",
        }

        if value not in allowed_statuses:
            raise ValueError(
                f"Status must be one of: {', '.join(sorted(allowed_statuses))}"
            )

        return value

    @field_validator("resolution")
    @classmethod
    def validate_resolution(
        cls,
        value: str | None,
    ) -> str | None:
        if value is None:
            return None

        allowed_resolutions = {
            "Fixed",
            "Duplicate",
            "Cannot Reproduce",
            "Won't Fix",
            "Not a Bug",
            "By Design",
        }

        if value not in allowed_resolutions:
            raise ValueError(
                "Resolution must be one of: "
                + ", ".join(sorted(allowed_resolutions))
            )

        return value

    @model_validator(mode="after")
    def validate_status_and_resolution(self):
        if self.status == "Closed" and self.resolution is None:
            raise ValueError(
                "Resolution is required when Bug status is Closed."
            )

        if self.status != "Closed" and self.resolution is not None:
            raise ValueError(
                "Resolution must be empty unless Bug status is Closed."
            )

        return self


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