from sqlalchemy.orm import Session

from app.ai.prompts.test_cases import (
    build_test_case_prompt,
)
from app.ai.service import AIService
from app.models.test_scenario import TestScenario


class AITestCaseService:
    def __init__(
        self,
        db: Session,
    ):
        self.db = db
        self.ai_service = AIService()
        def __init__(
            self,
            db: Session,
        ):
            self.db = db
            self.ai_service = AIService()

    def generate_test_cases(
        self,
        scenario_id: int,
        manual_description: str,
        number_of_test_cases: int,
    ):
        scenario = (
            self.db.query(TestScenario)
            .filter(TestScenario.id == scenario_id)
            .first()
        )

        if not scenario:
            raise ValueError(
                "Scenario not found."
            )

        prompt = build_test_case_prompt(
            scenario_code=scenario.scenario_code,
            module=scenario.module,
            scenario_title=scenario.title,
            scenario_description=scenario.description
            or "",
            manual_description=manual_description,
            number_of_test_cases=number_of_test_cases,
        )

        return self.ai_service.generate_json(
            prompt,
        )