from sqlalchemy.orm import Session

from app.ai.prompts.scenarios import (
    build_scenario_prompt,
)
from app.ai.service import AIService
from app.repositories.requirement_repository import (
    RequirementRepository,
)


class AIScenarioService:
    def __init__(
        self,
        db: Session,
    ):
        self.db = db
        self.ai_service = AIService()
        self.requirement_repository = (
            RequirementRepository(db)
        )

    def _generate_for_requirement(
        self,
        requirement,
        manual_description: str,
        number_of_scenarios: int,
    ):
        prompt = build_scenario_prompt(
            requirement_code=requirement.requirement_code,
            requirement_module=requirement.module,
            requirement_description=requirement.description
            or "",
            manual_description=manual_description,
            number_of_scenarios=number_of_scenarios,
        )

        return self.ai_service.generate_json(
            prompt,
        )

    def generate_scenarios(
        self,
        project_id: int,
        requirement_id: int | None,
        generate_for_all: bool,
        manual_description: str,
        number_of_scenarios: int,
    ):
        if generate_for_all:

            requirements = (
                self.requirement_repository.get_by_project(
                    project_id
                )
            )

            if not requirements:
                raise ValueError(
                    "No requirements found."
                )

            generated = []

            for requirement in requirements:
                generated.extend(
                    self._generate_for_requirement(
                        requirement,
                        manual_description,
                        number_of_scenarios,
                    )
                )

            return generated

        requirement = (
            self.requirement_repository.get_by_id(
                requirement_id
            )
        )

        if not requirement:
            raise ValueError(
                "Requirement not found."
            )

        return self._generate_for_requirement(
            requirement,
            manual_description,
            number_of_scenarios,
        )