from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class AutomationProjectCreate(BaseModel):
    project_id: int
    name: str
    framework: str
    status: str = "Active"
    repository_url: Optional[str] = None


class AutomationProjectUpdate(BaseModel):
    name: str
    framework: str
    status: str
    repository_url: Optional[str] = None


class AutomationProjectResponse(BaseModel):
    id: int
    project_id: int
    name: str
    framework: str
    status: str
    repository_url: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True