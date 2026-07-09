from pydantic import BaseModel


class ProjectCreate(BaseModel):
    name: str
    description: str | None = None


class ProjectResponse(ProjectCreate):
    id: int

    class Config:
        from_attributes = True