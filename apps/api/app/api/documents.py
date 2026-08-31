from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_admin
from app.db.session import get_db
from app.models.admin import Admin
from app.schemas.document import DocumentResponse
from app.services.document_service import DocumentService


router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)


@router.post(
    "/upload",
    response_model=DocumentResponse,
)
def upload_document(
    file: Annotated[UploadFile, File(...)],
    project_id: int = Form(...),
    title: str = Form(...),
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    service = DocumentService(db)

    try:
        return service.upload_document(
            project_id=project_id,
            title=title,
            file=file,
            uploaded_by=str(admin.id),
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


@router.get(
    "/project/{project_id}",
    response_model=list[DocumentResponse],
)
def get_project_documents(
    project_id: int,
    db: Session = Depends(get_db),
    _: Admin = Depends(get_current_admin),
):
    service = DocumentService(db)

    try:
        return service.get_documents(project_id)

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        )


@router.get(
    "/{document_id}/download",
)
def download_document(
    document_id: int,
    db: Session = Depends(get_db),
    _: Admin = Depends(get_current_admin),
):
    service = DocumentService(db)

    try:
        document = service.get_document(document_id)

        file_content = service.storage_service.download_file(
            document.storage_key
        )

        content_types = {
            "pdf": "application/pdf",
            "docx": (
                "application/vnd.openxmlformats-officedocument."
                "wordprocessingml.document"
            ),
        }

        content_type = content_types.get(
            document.file_type,
            "application/octet-stream",
        )

        return Response(
            content=file_content,
            media_type=content_type,
            headers={
                "Content-Disposition": (
                    f'attachment; filename="{document.file_name}"'
                )
            },
        )

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        )

    except RuntimeError as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


@router.get(
    "/{document_id}",
    response_model=DocumentResponse,
)
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    _: Admin = Depends(get_current_admin),
):
    service = DocumentService(db)

    try:
        return service.get_document(document_id)

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        )


@router.delete(
    "/{document_id}",
)
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    _: Admin = Depends(get_current_admin),
):
    service = DocumentService(db)

    try:
        service.delete_document(document_id)

        return {
            "message": "Document deleted successfully",
        }

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        )