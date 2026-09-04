from datetime import datetime

from pydantic import BaseModel


class BugRetestCreate(BaseModel):
    execution_type: str = "Manual"


class BugRetestExecutionResponse(BaseModel):
    id: int
    run_id: int
    test_case_id: int
    status: str
    test_run: "BugRetestRunResponse"

    class Config:
        from_attributes = True


class BugRetestRunResponse(BaseModel):
    id: int
    run_code: str
    name: str
    execution_type: str
    automation_token: str | None = None

    class Config:
        from_attributes = True


class BugRetestResponse(BaseModel):
    id: int
    bug_id: int
    execution_id: int
    created_at: datetime
    execution: BugRetestExecutionResponse

    class Config:
        from_attributes = True

BugRetestExecutionResponse.model_rebuild()