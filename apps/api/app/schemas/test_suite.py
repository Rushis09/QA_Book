from datetime import datetime

from pydantic import BaseModel


class TestSuiteProjectResponse(BaseModel):
    id: int
    project_code: str
    name: str

    class Config:
        from_attributes = True


class TestSuiteBase(BaseModel):
    project_id: int
    name: str
    description: str | None = None
    status: str


class TestSuiteCreate(TestSuiteBase):
    pass


class TestSuiteUpdate(TestSuiteBase):
    pass


class TestSuiteTestCaseResponse(BaseModel):
    id: int
    test_case_code: str
    title: str

    class Config:
        from_attributes = True


class TestSuiteResponse(TestSuiteBase):
    id: int
    suite_code: str
    project: TestSuiteProjectResponse
    test_cases: list[TestSuiteTestCaseResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True