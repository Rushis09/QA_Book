from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class TestExecutionRunResponse(BaseModel):
    id: int
    run_code: str
    name: str

    class Config:
        from_attributes = True


class TestExecutionTestCaseResponse(BaseModel):
    id: int
    test_case_code: str
    title: str
    priority: str
    preconditions: str | None = None
    steps: str | None = None
    expected_result: str | None = None


    class Config:
        from_attributes = True


class TestExecutionBase(BaseModel):
    run_id: int
    test_case_id: int
    status: str = "Not Executed"
    actual_result: Optional[str] = None
    comments: Optional[str] = None
    executed_by: Optional[str] = None
    executed_at: Optional[datetime] = None


class TestExecutionCreate(TestExecutionBase):
    pass


class TestExecutionUpdate(TestExecutionBase):
    pass


class TestExecutionResponse(TestExecutionBase):
    id: int
    test_run: TestExecutionRunResponse
    test_case: TestExecutionTestCaseResponse
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True