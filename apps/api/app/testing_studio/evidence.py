from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, UploadFile
from fastapi.responses import Response
from sqlalchemy.orm import Session
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.sql import func

from app.auth.dependencies import get_current_admin
from app.db.database import Base
from app.db.session import get_db
from app.models.admin import Admin
from app.testing_studio.service import TestingStudioService
from app.services.storage_service import StorageService


class TestingEvidence(Base):
    __tablename__ = "testing_evidence"

    id = Column(Integer, primary_key=True, index=True)
    test_case_id = Column(Integer, ForeignKey("test_cases.id", ondelete="CASCADE"), nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    content_type = Column(String(120), nullable=False)
    file_size = Column(Integer, nullable=False)
    storage_key = Column(String(500), nullable=False, unique=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


router = APIRouter(prefix="/testing-studio", tags=["Testing Studio Evidence"])


@router.post("/test-cases/{test_case_id}/evidence")
def upload_evidence(test_case_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    svc = TestingStudioService(db)
    case = svc.get_case_for_admin(test_case_id, admin)
    ext = Path(file.filename or "").suffix.lower()
    allowed = {".png", ".jpg", ".jpeg", ".webp", ".pdf", ".txt", ".log"}
    if ext not in allowed:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Unsupported evidence file type.")
    content = file.file.read()
    if not content:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Evidence file is empty.")
    storage = StorageService()
    key = f"projects/testing-evidence/test-cases/{case.id}/{uuid4().hex}{ext}"
    storage.upload_file(content, key, file.content_type or "application/octet-stream")
    item = TestingEvidence(test_case_id=case.id, file_name=file.filename or "evidence", content_type=file.content_type or "application/octet-stream", file_size=len(content), storage_key=key)
    try:
        db.add(item)
        db.commit()
        db.refresh(item)
    except Exception:
        storage.delete_file(key)
        raise
    return {"id": item.id, "file_name": item.file_name, "content_type": item.content_type, "file_size": item.file_size, "uploaded_at": item.uploaded_at}


@router.get("/evidence/{evidence_id}/download")
def download_evidence(evidence_id: int, db: Session = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    from fastapi import HTTPException
    item = db.query(TestingEvidence).filter(TestingEvidence.id == evidence_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Evidence not found")
    TestingStudioService(db).get_case_for_admin(item.test_case_id, admin)
    content = StorageService().download_file(item.storage_key)
    return Response(content=content, media_type=item.content_type, headers={"Content-Disposition": f'attachment; filename="{item.file_name}"'})
