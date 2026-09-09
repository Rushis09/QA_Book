from sqlalchemy.orm import Session

from app.ai.credential_service import AICredentialService
from app.ai.prompts.test_cases import build_test_case_prompt
from app.ai.service import AIService
from app.models.admin import Admin
from app.repositories.test_scenario_repository import TestScenarioRepository


class AITestCaseService:
    def __init__(self, db: Session, admin: Admin):
        self.db = db
        self.admin = admin

        credential_service = AICredentialService(db)
        api_key = credential_service.get_api_key(admin=admin)

        self.ai_service = AIService(api_key=api_key)
        self.scenario_repository = TestScenarioRepository(db)

    def _generate_for_scenario(
        self,
        scenario,
        number_of_test_cases: int,
        manual_description: str,
    ):
        prompt = build_test_case_prompt(
            scenario_code=scenario.scenario_code,
            module=scenario.module,
            scenario_title=scenario.title,
            scenario_description=scenario.description or "",
            manual_description=manual_description,
            number_of_test_cases=number_of_test_cases,
        )

        return self.ai_service.generate_json(prompt)

    def generate_test_cases(
        self,
        scenario_id: int,
        manual_description: str,
        number_of_test_cases: int,
    ):
        scenario = self.scenario_repository.get_by_id(
            scenario_id
        )

        if not scenario:
            raise ValueError("Test scenario not found.")

        return self._generate_for_scenario(
            scenario=scenario,
            number_of_test_cases=number_of_test_cases,
            manual_description=manual_description,
        )