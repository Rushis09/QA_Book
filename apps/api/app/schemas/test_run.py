from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class TestRunSuiteResponse(BaseModel):
    id: int
    suite_code: str
    name: str

    class Config:
        from_attributes = True


class TestRunBase(BaseModel):
    suite_id: int
    name: str
    build_version: Optional[str] = None
    environment: Optional[str] = None
    tester: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: str = "Not Started"


class TestRunCreate(TestRunBase):
    pass


class TestRunUpdate(TestRunBase):
    pass


class TestRunResponse(TestRunBase):
    id: int
    run_code: str
    suite: TestRunSuiteResponse
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True