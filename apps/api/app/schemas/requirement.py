from datetime import datetime

from pydantic import BaseModel


class RequirementProjectResponse(BaseModel):
    id: int
    project_code: str
    name: str

    class Config:
        from_attributes = True


class RequirementBase(BaseModel):
    project_id: int
    module: str
    priority: str
    status: str
    description: str | None = None


class RequirementCreate(RequirementBase):
    pass


class RequirementUpdate(RequirementBase):
    pass


class RequirementResponse(RequirementBase):
    id: int
    requirement_code: str
    created_at: datetime
    updated_at: datetime
    project: RequirementProjectResponse

    class Config:
        from_attributes = True