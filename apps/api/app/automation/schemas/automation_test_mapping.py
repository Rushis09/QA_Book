from datetime import datetime

from pydantic import BaseModel


class AutomationTestMappingCreate(BaseModel):
    automation_project_id: int
    test_case_id: int
    test_name: str
    test_file_path: str


class AutomationTestMappingBulkCreate(BaseModel):
    automation_project_id: int
    test_case_ids: list[int]


class AutomationTestMappingUpdate(BaseModel):
    test_name: str
    test_file_path: str


class AutomationTestMappingResponse(BaseModel):
    id: int
    automation_project_id: int
    test_case_id: int
    test_name: str
    test_file_path: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True