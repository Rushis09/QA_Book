from sqlalchemy.orm import Session

from app.ai.prompts.test_suite import (
    build_test_suite_recommendation_prompt,
)
from app.ai.service import AIService
from app.models.test_case import TestCase
from app.models.test_suite import TestSuite


class AITestSuiteService:
    def __init__(self, db: Session):
        self.db = db
        self.ai_service = AIService()

    def recommend_test_cases(
        self,
        suite_id: int,
        test_case_ids: list[int],
    ):
        suite = (
            self.db.query(TestSuite)
            .filter(TestSuite.id == suite_id)
            .first()
        )

        if not suite:
            raise ValueError(
                "Test Suite not found."
            )

        if not test_case_ids:
            return {
                "recommended_test_case_ids": []
            }

        test_cases = (
            self.db.query(TestCase)
            .filter(
                TestCase.id.in_(test_case_ids)
            )
            .all()
        )

        if len(test_cases) != len(
            set(test_case_ids)
        ):
            raise ValueError(
                "One or more test cases were not found."
            )

        candidates = []

        for test_case in test_cases:
            scenario = test_case.scenario
            requirement = scenario.requirement

            if (
                requirement.project_id
                != suite.project_id
            ):
                raise ValueError(
                    "Test case does not belong to the test suite project."
                )

            candidates.append(
                {
                    "id": test_case.id,
                    "test_case_code": (
                        test_case.test_case_code
                    ),
                    "requirement_code": (
                        requirement.requirement_code
                    ),
                    "scenario_code": (
                        scenario.scenario_code
                    ),
                    "scenario_title": (
                        scenario.title
                    ),
                    "module": test_case.module,
                    "priority": test_case.priority,
                    "status": test_case.status,
                    "title": test_case.title,
                }
            )

        prompt = (
            build_test_suite_recommendation_prompt(
                suite_name=suite.name,
                suite_description=(
                    suite.description or ""
                ),
                test_cases=candidates,
            )
        )

        response = self.ai_service.generate_json(
            prompt
        )

        recommended_ids = response.get(
            "recommended_test_case_ids"
        )

        if not isinstance(
            recommended_ids,
            list,
        ):
            raise ValueError(
                "AI returned an invalid recommendation."
            )

        candidate_ids = {
            test_case.id
            for test_case in test_cases
        }

        validated_ids = [
            test_case_id
            for test_case_id in recommended_ids
            if isinstance(test_case_id, int)
            and test_case_id in candidate_ids
        ]

        return {
            "recommended_test_case_ids": (
                validated_ids
            )
        }