from datetime import datetime

from pydantic import BaseModel


class TestScenarioRequirementResponse(BaseModel):
    id: int
    requirement_code: str
    module: str

    class Config:
        from_attributes = True


class TestScenarioBase(BaseModel):
    requirement_id: int
    module: str
    title: str
    description: str | None = None
    priority: str
    status: str


class TestScenarioCreate(TestScenarioBase):
    pass


class TestScenarioUpdate(TestScenarioBase):
    pass


class TestScenarioResponse(TestScenarioBase):
    id: int
    scenario_code: str
    requirement: TestScenarioRequirementResponse
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True