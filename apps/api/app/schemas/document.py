from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DocumentResponse(BaseModel):
    id: int
    document_code: str
    project_id: int
    document_type: str
    title: str
    file_name: str
    file_type: str
    file_size: int
    status: str
    uploaded_by: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)