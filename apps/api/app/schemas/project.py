from datetime import date, datetime

from pydantic import BaseModel


class ProjectBase(BaseModel):
    name: str
    description: str | None = None
    status: str = "Active"
    version: str | None = None
    start_date: date | None = None
    end_date: date | None = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(ProjectBase):
    pass


class ProjectResponse(ProjectBase):
    id: int
    project_code: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True