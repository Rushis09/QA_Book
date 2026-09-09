from sqlalchemy.orm import Session

from app.ai.credential_service import AICredentialService
from app.ai.prompts.test_cases import (
    build_bulk_test_case_prompt,
    build_test_case_prompt,
)
from app.ai.schemas import (
    BulkTestCaseCandidate,
    BulkTestCaseGenerationResponse,
    BulkTestCaseResult,
)
from app.ai.service import AIService
from app.models.admin import Admin
from app.models.test_scenario import TestScenario
from app.repositories.test_scenario_repository import (
    TestScenarioRepository,
)


class AITestCaseService:
    BATCH_SIZE = 5

    def __init__(
        self,
        db: Session,
        admin: Admin,
    ):
        self.db = db
        self.admin = admin

        credential_service = AICredentialService(db)

        api_key = credential_service.get_api_key(
            admin=admin
        )

        self.ai_service = AIService(
            api_key=api_key
        )

        self.scenario_repository = (
            TestScenarioRepository(db)
        )

    # ============================================================
    # Single Scenario Generation
    # ============================================================

    def _generate_for_scenario(
        self,
        scenario,
        number_of_test_cases: int,
        manual_description: str,
    ):
        prompt = build_test_case_prompt(
            scenario_code=(
                scenario.scenario_code
            ),
            module=scenario.module,
            scenario_title=scenario.title,
            scenario_description=(
                scenario.description or ""
            ),
            manual_description=(
                manual_description
            ),
            number_of_test_cases=(
                number_of_test_cases
            ),
        )

        return self.ai_service.generate_json(
            prompt
        )

    def generate_test_cases(
        self,
        scenario_id: int,
        manual_description: str,
        number_of_test_cases: int,
    ):
        scenario = (
            self.scenario_repository.get_by_id(
                scenario_id
            )
        )

        if not scenario:
            raise ValueError(
                "Test scenario not found."
            )

        return self._generate_for_scenario(
            scenario=scenario,
            number_of_test_cases=(
                number_of_test_cases
            ),
            manual_description=(
                manual_description
            ),
        )

    # ============================================================
    # Bulk Test Case Generation
    # ============================================================

    def generate_test_cases_bulk(
        self,
        scenario_ids: list[int],
        manual_description: str,
        number_of_test_cases: int,
    ) -> BulkTestCaseGenerationResponse:

        unique_scenario_ids = list(
            dict.fromkeys(scenario_ids)
        )

        if not unique_scenario_ids:
            raise ValueError(
                "At least one test scenario is required."
            )

        scenarios = (
            self.db.query(TestScenario)
            .filter(
                TestScenario.id.in_(
                    unique_scenario_ids
                )
            )
            .all()
        )

        scenarios_by_id = {
            scenario.id: scenario
            for scenario in scenarios
        }

        missing_scenario_ids = [
            scenario_id
            for scenario_id in unique_scenario_ids
            if scenario_id
            not in scenarios_by_id
        ]

        if missing_scenario_ids:
            raise ValueError(
                "One or more test scenarios were not found."
            )

        ordered_scenarios = [
            scenarios_by_id[scenario_id]
            for scenario_id in unique_scenario_ids
        ]

        results: list[BulkTestCaseResult] = []
        errors: list[str] = []

        for batch_start in range(
            0,
            len(ordered_scenarios),
            self.BATCH_SIZE,
        ):
            batch = ordered_scenarios[
                batch_start:
                batch_start + self.BATCH_SIZE
            ]

            try:
                batch_results = (
                    self._generate_test_case_batch(
                        scenarios=batch,
                        manual_description=(
                            manual_description
                        ),
                        number_of_test_cases=(
                            number_of_test_cases
                        ),
                    )
                )

                results.extend(batch_results)

            except Exception as error:
                batch_scenario_codes = ", ".join(
                    scenario.scenario_code
                    for scenario in batch
                )

                errors.append(
                    "Test case generation failed for "
                    f"scenarios [{batch_scenario_codes}]: "
                    f"{error}"
                )

                for scenario in batch:
                    results.append(
                        BulkTestCaseResult(
                            scenario_id=scenario.id,
                            scenario_code=(
                                scenario.scenario_code
                            ),
                            test_cases=[],
                            validation_warnings=[
                                "AI generation failed for this scenario."
                            ],
                        )
                    )

        return BulkTestCaseGenerationResponse(
            requested_scenario_count=(
                len(unique_scenario_ids)
            ),
            processed_scenario_count=(
                len(ordered_scenarios)
            ),
            results=results,
            errors=errors,
        )

    # ============================================================
    # Batch Processing
    # ============================================================

    def _generate_test_case_batch(
        self,
        scenarios: list[TestScenario],
        manual_description: str,
        number_of_test_cases: int,
    ) -> list[BulkTestCaseResult]:

        scenario_context = [
            {
                "id": scenario.id,
                "scenario_code": (
                    scenario.scenario_code
                ),
                "module": (
                    scenario.module or ""
                ),
                "title": (
                    scenario.title or ""
                ),
                "description": (
                    scenario.description or ""
                ),
            }
            for scenario in scenarios
        ]

        prompt = build_bulk_test_case_prompt(
            scenarios=scenario_context,
            manual_description=(
                manual_description
            ),
            number_of_test_cases=(
                number_of_test_cases
            ),
        )

        response = self.ai_service.generate_json(
            prompt
        )

        if not isinstance(response, list):
            raise ValueError(
                "AI returned an invalid bulk test case response."
            )

        results_by_scenario_id = {
            scenario.id: BulkTestCaseResult(
                scenario_id=scenario.id,
                scenario_code=(
                    scenario.scenario_code
                ),
                test_cases=[],
                validation_warnings=[],
            )
            for scenario in scenarios
        }

        valid_scenario_ids = {
            scenario.id
            for scenario in scenarios
        }

        for group in response:
            if not isinstance(
                group,
                dict,
            ):
                continue

            scenario_id = group.get(
                "scenario_id"
            )

            scenario_code = group.get(
                "scenario_code"
            )

            if (
                not isinstance(
                    scenario_id,
                    int,
                )
                or scenario_id
                not in valid_scenario_ids
            ):
                continue

            expected_scenario = next(
                scenario
                for scenario in scenarios
                if scenario.id
                == scenario_id
            )

            if (
                scenario_code
                != expected_scenario.scenario_code
            ):
                results_by_scenario_id[
                    scenario_id
                ].validation_warnings.append(
                    "AI returned an incorrect scenario code."
                )
                continue

            test_cases = group.get(
                "test_cases",
                [],
            )

            if not isinstance(
                test_cases,
                list,
            ):
                results_by_scenario_id[
                    scenario_id
                ].validation_warnings.append(
                    "AI returned an invalid test_cases collection."
                )
                continue

            seen_titles: set[str] = set()
            seen_signatures: set[str] = set()

            for test_case in test_cases:
                validated_candidate = (
                    self._validate_test_case_candidate(
                        test_case=test_case,
                        scenario_id=scenario_id,
                        scenario_code=scenario_code,
                        seen_titles=seen_titles,
                        seen_signatures=(
                            seen_signatures
                        ),
                    )
                )

                if validated_candidate is None:
                    continue

                results_by_scenario_id[
                    scenario_id
                ].test_cases.append(
                    validated_candidate
                )

        for scenario in scenarios:
            result = results_by_scenario_id[
                scenario.id
            ]

            if not result.test_cases:
                result.validation_warnings.append(
                    "No valid test cases were returned."
                )

        return [
            results_by_scenario_id[
                scenario.id
            ]
            for scenario in scenarios
        ]

    # ============================================================
    # Candidate Validation
    # ============================================================

    @staticmethod
    def _validate_test_case_candidate(
        test_case,
        scenario_id: int,
        scenario_code: str,
        seen_titles: set[str],
        seen_signatures: set[str],
    ) -> BulkTestCaseCandidate | None:

        if not isinstance(
            test_case,
            dict,
        ):
            return None

        candidate = {
            "source_scenario_id": (
                scenario_id
            ),
            "source_scenario_code": (
                scenario_code
            ),
            "title": test_case.get(
                "title"
            ),
            "priority": test_case.get(
                "priority"
            ),
            "preconditions": test_case.get(
                "preconditions"
            ),
            "test_data": test_case.get(
                "test_data"
            ),
            "steps": test_case.get(
                "steps"
            ),
            "expected_result": test_case.get(
                "expected_result"
            ),
        }

        try:
            validated = (
                BulkTestCaseCandidate.model_validate(
                    candidate
                )
            )
        except Exception:
            return None

        normalized_title = (
            " ".join(
                validated.title
                .strip()
                .lower()
                .split()
            )
        )

        normalized_signature = " ".join(
            [
                validated.title,
                validated.preconditions,
                validated.test_data,
                validated.steps,
                validated.expected_result,
            ]
        ).strip().lower()

        if normalized_title in seen_titles:
            return None

        if (
            normalized_signature
            in seen_signatures
        ):
            return None

        seen_titles.add(
            normalized_title
        )

        seen_signatures.add(
            normalized_signature
        )

        return validated