import re

from sqlalchemy.orm import Session

from app.ai.credential_service import AICredentialService
from app.ai.prompts.test_suite import (
    build_test_suite_recommendation_prompt,
)
from app.ai.service import AIService
from app.models.admin import Admin
from app.models.test_case import TestCase
from app.models.test_suite import TestSuite


STOP_WORDS = {
    "the",
    "and",
    "for",
    "with",
    "from",
    "that",
    "this",
    "test",
    "tests",
    "case",
    "cases",
    "suite",
    "testing",
    "verify",
    "validate",
    "validation",
    "should",
    "must",
    "can",
    "will",
    "into",
    "using",
    "when",
    "where",
    "user",
    "users",
}


class AITestSuiteService:
    def __init__(self, db: Session, admin: Admin):
        self.db = db
        self.admin = admin

        credential_service = AICredentialService(db)
        api_key = credential_service.get_api_key(admin=admin)

        self.ai_service = AIService(api_key=api_key)

    @staticmethod
    def _tokenize(text: str) -> set[str]:
        words = re.findall(
            r"[a-z0-9]+",
            (text or "").lower(),
        )

        return {
            word
            for word in words
            if len(word) >= 3
            and word not in STOP_WORDS
        }

    @classmethod
    def _calculate_relevance_score(
        cls,
        suite_name: str,
        suite_description: str,
        test_case: dict,
    ) -> int:
        suite_tokens = cls._tokenize(
            f"{suite_name} {suite_description}"
        )

        if not suite_tokens:
            return 0

        title_tokens = cls._tokenize(
            test_case["title"]
        )

        scenario_tokens = cls._tokenize(
            test_case["scenario_title"]
        )

        module_tokens = cls._tokenize(
            test_case["module"]
        )

        requirement_tokens = cls._tokenize(
            test_case["requirement_code"]
        )

        score = 0

        score += len(
            suite_tokens & title_tokens
        ) * 5

        score += len(
            suite_tokens & scenario_tokens
        ) * 4

        score += len(
            suite_tokens & module_tokens
        ) * 6

        score += len(
            suite_tokens & requirement_tokens
        ) * 3

        return score

    @classmethod
    def _select_relevant_candidates(
        cls,
        suite_name: str,
        suite_description: str,
        candidates: list[dict],
    ) -> list[dict]:
        if len(candidates) <= 100:
            return candidates

        scored_candidates = [
            (
                cls._calculate_relevance_score(
                    suite_name=suite_name,
                    suite_description=suite_description,
                    test_case=candidate,
                ),
                candidate,
            )
            for candidate in candidates
        ]

        scored_candidates.sort(
            key=lambda item: item[0],
            reverse=True,
        )

        relevant_candidates = [
            candidate
            for score, candidate in scored_candidates
            if score > 0
        ]

        if not relevant_candidates:
            return candidates[:100]

        return relevant_candidates[:100]

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

        relevant_candidates = (
            self._select_relevant_candidates(
                suite_name=suite.name,
                suite_description=(
                    suite.description or ""
                ),
                candidates=candidates,
            )
        )

        prompt = (
            build_test_suite_recommendation_prompt(
                suite_name=suite.name,
                suite_description=(
                    suite.description or ""
                ),
                test_cases=relevant_candidates,
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
            test_case["id"]
            for test_case in relevant_candidates
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