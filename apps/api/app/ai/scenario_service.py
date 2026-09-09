from sqlalchemy.orm import Session

from app.ai.credential_service import AICredentialService
from app.ai.prompts.scenarios import build_scenario_prompt
from app.ai.service import AIService
from app.models.admin import Admin
from app.repositories.requirement_repository import RequirementRepository


class AIScenarioService:
    def __init__(self, db: Session, admin: Admin):
        self.db = db
        self.admin = admin

        credential_service = AICredentialService(db)
        api_key = credential_service.get_api_key(admin=admin)

        self.ai_service = AIService(api_key=api_key)
        self.requirement_repository = RequirementRepository(db)

    def _generate_for_requirement(
        self,
        requirement,
        number_of_scenarios: int,
        manual_description: str,
    ):
        prompt = build_scenario_prompt(
            requirement_code=requirement.requirement_code,
            requirement_module=requirement.module,
            requirement_description=requirement.description,
            manual_description=manual_description,
            number_of_scenarios=number_of_scenarios,
        )

        return self.ai_service.generate_json(prompt)

    def generate_scenarios(
        self,
        project_id: int,
        requirement_id: int | None,
        generate_for_all: bool,
        manual_description: str,
        number_of_scenarios: int,
    ):
        if generate_for_all:
            requirements = self.requirement_repository.get_by_project(
                project_id
            )

            generated_scenarios = []

            for requirement in requirements:
                generated_scenarios.extend(
                    self._generate_for_requirement(
                        requirement=requirement,
                        number_of_scenarios=number_of_scenarios,
                        manual_description=manual_description,
                    )
                )

            return generated_scenarios

        if requirement_id is None:
            raise ValueError(
                "Requirement is required when generate_for_all is false."
            )

        requirement = self.requirement_repository.get_by_id(
            requirement_id
        )

        if not requirement:
            raise ValueError("Requirement not found.")

        if requirement.project_id != project_id:
            raise ValueError(
                "Requirement does not belong to the selected project."
            )

        return self._generate_for_requirement(
            requirement=requirement,
            number_of_scenarios=number_of_scenarios,
            manual_description=manual_description,
        )