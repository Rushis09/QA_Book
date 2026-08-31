from sqlalchemy.orm import Session

from app.ai.prompts.brd_requirements import (
    build_brd_requirement_prompt,
)
from app.ai.prompts.requirements import (
    build_requirement_prompt,
)
from app.ai.service import AIService
from app.repositories.document_repository import (
    DocumentRepository,
)
from app.repositories.project_repository import (
    ProjectRepository,
)
from app.services.document_extractor import (
    DocumentExtractor,
)
from app.services.storage_service import StorageService


class AIRequirementService:
    def __init__(
        self,
        db: Session,
    ):
        self.db = db
        self.ai_service = AIService()
        self.storage_service = StorageService()

    def generate_requirements(
        self,
        project_id: int,
        manual_description: str,
        number_of_requirements: int,
    ):
        project = ProjectRepository.get_by_id(
            self.db,
            project_id,
        )

        if not project:
            raise ValueError(
                "Project not found."
            )

        prompt = build_requirement_prompt(
            project_name=project.name,
            project_description=project.description or "",
            manual_description=manual_description,
            number_of_requirements=number_of_requirements,
        )

        return self.ai_service.generate_json(
            prompt,
        )

    def generate_requirements_from_brd(
        self,
        project_id: int,
        document_id: int,
        number_of_requirements: int,
    ):
        project = ProjectRepository.get_by_id(
            self.db,
            project_id,
        )

        if not project:
            raise ValueError(
                "Project not found."
            )

        document = DocumentRepository.get_by_id(
            self.db,
            document_id,
        )

        if not document:
            raise ValueError(
                "Document not found."
            )

        if document.project_id != project_id:
            raise ValueError(
                "Document does not belong to this project."
            )

        if document.file_type != "docx":
            raise ValueError(
                "Only DOCX BRD documents are supported."
            )

        file_content = self.storage_service.download_file(
            document.storage_key
        )

        brd_text = DocumentExtractor.extract_docx(
            file_content
        )

        if not brd_text.strip():
            raise ValueError(
                "BRD document contains no readable text."
            )

        prompt = build_brd_requirement_prompt(
            project_name=project.name,
            brd_text=brd_text,
            number_of_requirements=number_of_requirements,
        )

        return self.ai_service.generate_json(
            prompt,
        )