from datetime import datetime

from pydantic import BaseModel


class TestCaseScenarioResponse(BaseModel):
    id: int
    scenario_code: str
    title: str

    class Config:
        from_attributes = True


class TestCaseBase(BaseModel):
    scenario_id: int
    component: str
    priority: str
    title: str
    description: str | None = None
    preconditions: str | None = None
    test_data: str | None = None
    steps: str | None = None
    expected_result: str | None = None


class TestCaseCreate(TestCaseBase):
    pass


class TestCaseUpdate(TestCaseBase):
    pass


class TestCaseResponse(TestCaseBase):
    id: int
    test_case_code: str
    scenario: TestCaseScenarioResponse
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True