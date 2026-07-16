

from sqlalchemy.orm import Session

from app.ai.prompts.requirements import (
    build_requirement_prompt,
)
from app.ai.service import AIService
from app.repositories.project_repository import (
    ProjectRepository,
)


class AIRequirementService:
    def __init__(
        self,
        db: Session,
    ):
        self.db = db
        self.ai_service = AIService()

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