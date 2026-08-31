import os
from pathlib import Path

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.models.document import Document
from app.repositories.document_repository import DocumentRepository
from app.repositories.project_repository import ProjectRepository
from app.services.storage_service import StorageService


class DocumentService:
    def __init__(self, db: Session):
        self.db = db
        self.storage_service = StorageService()

    def _generate_document_code(
        self,
        project_id: int,
    ) -> str:
        documents = DocumentRepository.get_all_by_project(
            self.db,
            project_id,
        )

        if not documents:
            return "BRD001"

        highest_number = 0

        for document in documents:
            if document.document_code.startswith("BRD"):
                try:
                    number = int(
                        document.document_code[3:]
                    )
                    highest_number = max(
                        highest_number,
                        number,
                    )
                except ValueError:
                    continue

        return f"BRD{highest_number + 1:03d}"

    def upload_document(
        self,
        project_id: int,
        title: str,
        file: UploadFile,
        uploaded_by: str | None = None,
    ) -> Document:
        project = ProjectRepository.get_by_id(
            self.db,
            project_id,
        )

        if project is None:
            raise ValueError("Project not found")

        original_file_name = file.filename or ""

        extension = Path(
            original_file_name
        ).suffix.lower()

        allowed_extensions = {
            ".pdf": "application/pdf",
            ".docx": (
                "application/vnd.openxmlformats-officedocument."
                "wordprocessingml.document"
            ),
        }

        if extension not in allowed_extensions:
            raise ValueError(
                "Only PDF and DOCX files are supported."
            )

        file_content = file.file.read()

        if not file_content:
            raise ValueError("Uploaded file is empty.")

        document_code = self._generate_document_code(
            project_id
        )

        storage_key = (
            f"projects/{project_id}/documents/"
            f"{document_code}{extension}"
        )

        self.storage_service.upload_file(
            file_content=file_content,
            storage_key=storage_key,
            content_type=allowed_extensions[extension],
        )

        document = Document(
            document_code=document_code,
            project_id=project_id,
            document_type="BRD",
            title=title,
            file_name=original_file_name,
            file_type=extension.lstrip("."),
            file_size=len(file_content),
            storage_key=storage_key,
            status="Uploaded",
            uploaded_by=uploaded_by,
        )

        try:
            return DocumentRepository.create(
                self.db,
                document,
            )

        except Exception:
            self.storage_service.delete_file(
                storage_key
            )
            raise

    def get_documents(
        self,
        project_id: int,
    ) -> list[Document]:
        project = ProjectRepository.get_by_id(
            self.db,
            project_id,
        )

        if project is None:
            raise ValueError("Project not found")

        return DocumentRepository.get_all_by_project(
            self.db,
            project_id,
        )

    def get_document(
        self,
        document_id: int,
    ) -> Document:
        document = DocumentRepository.get_by_id(
            self.db,
            document_id,
        )

        if document is None:
            raise ValueError("Document not found")

        return document

    def delete_document(
        self,
        document_id: int,
    ) -> None:
        document = DocumentRepository.get_by_id(
            self.db,
            document_id,
        )

        if document is None:
            raise ValueError("Document not found")

        self.storage_service.delete_file(
            document.storage_key
        )

        DocumentRepository.delete(
            self.db,
            document,
        )