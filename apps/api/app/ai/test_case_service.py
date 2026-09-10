from copy import deepcopy

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
    GeneratedTestCase,
)
from app.ai.service import AIService
from app.models.admin import Admin
from app.models.test_scenario import TestScenario
from app.repositories.test_scenario_repository import TestScenarioRepository
from app.testing_studio.constants import ExecutionMethod, TestingType
from app.testing_studio.schemas import validate_definition


class AITestCaseService:
    BATCH_SIZE = 5

    def __init__(self, db: Session, admin: Admin):
        self.db = db
        self.admin = admin
        credential_service = AICredentialService(db)
        api_key = credential_service.get_api_key(admin=admin)
        self.ai_service = AIService(api_key=api_key)
        self.scenario_repository = TestScenarioRepository(db)

    @staticmethod
    def _normalize_testing_types(testing_types: list[TestingType] | None) -> list[TestingType]:
        values = testing_types or [TestingType.FUNCTIONAL]
        unique: list[TestingType] = []
        for value in values:
            normalized = value if isinstance(value, TestingType) else TestingType(value)
            if normalized not in unique:
                unique.append(normalized)
        return unique

    def _generate_for_scenario(
        self,
        scenario,
        number_of_test_cases: int,
        manual_description: str,
        testing_type: TestingType,
    ):
        prompt = build_test_case_prompt(
            scenario_code=scenario.scenario_code,
            module=scenario.module,
            scenario_title=scenario.title,
            scenario_description=scenario.description or "",
            manual_description=manual_description,
            number_of_test_cases=number_of_test_cases,
            testing_type=testing_type,
        )
        response = self.ai_service.generate_json(prompt)
        if not isinstance(response, list):
            raise ValueError("AI returned an invalid test case response.")

        validated: list[GeneratedTestCase] = []
        seen_titles: set[str] = set()
        seen_signatures: set[str] = set()

        for raw in response:
            candidate = self._validate_single_candidate(
                raw=raw,
                scenario_id=scenario.id,
                expected_type=testing_type,
                seen_titles=seen_titles,
                seen_signatures=seen_signatures,
            )
            if candidate:
                validated.append(candidate)

        return validated

    def _validate_single_candidate(
        self,
        raw,
        scenario_id: int,
        expected_type: TestingType,
        seen_titles: set[str],
        seen_signatures: set[str],
    ) -> GeneratedTestCase | None:
        if not isinstance(raw, dict):
            return None

        raw_type = raw.get("testing_type", expected_type.value)
        try:
            actual_type = TestingType(raw_type)
        except (TypeError, ValueError):
            return None
        if actual_type != expected_type:
            return None

        raw_method = raw.get("execution_method", ExecutionMethod.MANUAL.value)
        try:
            execution_method = ExecutionMethod(raw_method)
        except (TypeError, ValueError):
            return None

        attrs = deepcopy(raw.get("meta_attributes") or {})
        if not isinstance(attrs, dict):
            return None
        try:
            attrs = validate_definition(actual_type, attrs)
        except (ValueError, TypeError):
            return None

        candidate = {
            "testing_type": actual_type,
            "execution_method": execution_method,
            "title": raw.get("title"),
            "priority": raw.get("priority"),
            "description": raw.get("description", ""),
            "preconditions": raw.get("preconditions"),
            "test_data": raw.get("test_data"),
            "steps": raw.get("steps"),
            "expected_result": raw.get("expected_result"),
            "meta_attributes": attrs,
        }
        try:
            validated = GeneratedTestCase.model_validate(candidate)
        except Exception:
            return None

        normalized_title = " ".join(validated.title.strip().lower().split())
        normalized_signature = " ".join(
            [
                validated.testing_type.value,
                validated.title,
                validated.preconditions,
                validated.test_data,
                validated.steps,
                validated.expected_result,
            ]
        ).strip().lower()
        if normalized_title in seen_titles or normalized_signature in seen_signatures:
            return None

        seen_titles.add(normalized_title)
        seen_signatures.add(normalized_signature)
        return validated

    def generate_test_cases(
        self,
        scenario_id: int,
        manual_description: str,
        number_of_test_cases: int,
        testing_types: list[TestingType] | None = None,
    ):
        scenario = self.scenario_repository.get_by_id(scenario_id)
        if not scenario:
            raise ValueError("Test scenario not found.")

        generated: list[GeneratedTestCase] = []
        for testing_type in self._normalize_testing_types(testing_types):
            generated.extend(
                self._generate_for_scenario(
                    scenario=scenario,
                    number_of_test_cases=number_of_test_cases,
                    manual_description=manual_description,
                    testing_type=testing_type,
                )
            )
        return generated

    def generate_test_cases_bulk(
        self,
        scenario_ids: list[int],
        manual_description: str,
        number_of_test_cases: int,
        testing_types: list[TestingType] | None = None,
    ) -> BulkTestCaseGenerationResponse:
        unique_scenario_ids = list(dict.fromkeys(scenario_ids))
        if not unique_scenario_ids:
            raise ValueError("At least one test scenario is required.")

        scenarios = (
            self.db.query(TestScenario)
            .filter(TestScenario.id.in_(unique_scenario_ids))
            .all()
        )
        scenarios_by_id = {scenario.id: scenario for scenario in scenarios}
        if any(scenario_id not in scenarios_by_id for scenario_id in unique_scenario_ids):
            raise ValueError("One or more test scenarios were not found.")

        ordered_scenarios = [scenarios_by_id[scenario_id] for scenario_id in unique_scenario_ids]
        results: list[BulkTestCaseResult] = []
        errors: list[str] = []

        for testing_type in self._normalize_testing_types(testing_types):
            for batch_start in range(0, len(ordered_scenarios), self.BATCH_SIZE):
                batch = ordered_scenarios[batch_start:batch_start + self.BATCH_SIZE]
                try:
                    batch_results = self._generate_test_case_batch(
                        scenarios=batch,
                        manual_description=manual_description,
                        number_of_test_cases=number_of_test_cases,
                        testing_type=testing_type,
                    )
                    results.extend(batch_results)
                except Exception as error:
                    codes = ", ".join(s.scenario_code for s in batch)
                    errors.append(
                        f"Test case generation failed for scenarios [{codes}] "
                        f"and type [{testing_type.value}]: {error}"
                    )
                    for scenario in batch:
                        results.append(
                            BulkTestCaseResult(
                                scenario_id=scenario.id,
                                scenario_code=scenario.scenario_code,
                                test_cases=[],
                                validation_warnings=[
                                    f"AI generation failed for {testing_type.value} for this scenario."
                                ],
                            )
                        )

        return BulkTestCaseGenerationResponse(
            requested_scenario_count=len(unique_scenario_ids),
            processed_scenario_count=len(ordered_scenarios),
            results=results,
            errors=errors,
        )

    def _generate_test_case_batch(
        self,
        scenarios: list[TestScenario],
        manual_description: str,
        number_of_test_cases: int,
        testing_type: TestingType,
    ) -> list[BulkTestCaseResult]:
        scenario_context = [
            {
                "id": scenario.id,
                "scenario_code": scenario.scenario_code,
                "module": scenario.module or "",
                "title": scenario.title or "",
                "description": scenario.description or "",
            }
            for scenario in scenarios
        ]
        prompt = build_bulk_test_case_prompt(
            scenarios=scenario_context,
            manual_description=manual_description,
            number_of_test_cases=number_of_test_cases,
            testing_type=testing_type,
        )
        response = self.ai_service.generate_json(prompt)
        if not isinstance(response, list):
            raise ValueError("AI returned an invalid bulk test case response.")

        results_by_scenario_id = {
            scenario.id: BulkTestCaseResult(
                scenario_id=scenario.id,
                scenario_code=scenario.scenario_code,
                test_cases=[],
                validation_warnings=[],
            )
            for scenario in scenarios
        }
        valid_scenario_ids = set(results_by_scenario_id)

        for group in response:
            if not isinstance(group, dict):
                continue
            scenario_id = group.get("scenario_id")
            scenario_code = group.get("scenario_code")
            if not isinstance(scenario_id, int) or scenario_id not in valid_scenario_ids:
                continue
            expected_scenario = next(s for s in scenarios if s.id == scenario_id)
            if scenario_code != expected_scenario.scenario_code:
                results_by_scenario_id[scenario_id].validation_warnings.append(
                    "AI returned an incorrect scenario code."
                )
                continue

            test_cases = group.get("test_cases", [])
            if not isinstance(test_cases, list):
                results_by_scenario_id[scenario_id].validation_warnings.append(
                    "AI returned an invalid test_cases collection."
                )
                continue

            seen_titles: set[str] = set()
            seen_signatures: set[str] = set()
            for raw in test_cases:
                validated = self._validate_test_case_candidate(
                    test_case=raw,
                    scenario_id=scenario_id,
                    scenario_code=scenario_code,
                    expected_type=testing_type,
                    seen_titles=seen_titles,
                    seen_signatures=seen_signatures,
                )
                if validated:
                    results_by_scenario_id[scenario_id].test_cases.append(validated)

        for scenario in scenarios:
            if not results_by_scenario_id[scenario.id].test_cases:
                results_by_scenario_id[scenario.id].validation_warnings.append(
                    f"No valid {testing_type.value} test cases were returned."
                )
        return [results_by_scenario_id[scenario.id] for scenario in scenarios]

    @staticmethod
    def _validate_test_case_candidate(
        test_case,
        scenario_id: int,
        scenario_code: str,
        expected_type: TestingType,
        seen_titles: set[str],
        seen_signatures: set[str],
    ) -> BulkTestCaseCandidate | None:
        if not isinstance(test_case, dict):
            return None
        raw_type = test_case.get("testing_type", expected_type.value)
        try:
            actual_type = TestingType(raw_type)
        except (TypeError, ValueError):
            return None
        if actual_type != expected_type:
            return None

        raw_method = test_case.get("execution_method", ExecutionMethod.MANUAL.value)
        try:
            execution_method = ExecutionMethod(raw_method)
        except (TypeError, ValueError):
            return None

        attrs = deepcopy(test_case.get("meta_attributes") or {})
        if not isinstance(attrs, dict):
            return None
        try:
            attrs = validate_definition(actual_type, attrs)
        except (ValueError, TypeError):
            return None

        candidate = {
            "source_scenario_id": scenario_id,
            "source_scenario_code": scenario_code,
            "testing_type": actual_type,
            "execution_method": execution_method,
            "title": test_case.get("title"),
            "priority": test_case.get("priority"),
            "description": test_case.get("description", ""),
            "preconditions": test_case.get("preconditions"),
            "test_data": test_case.get("test_data"),
            "steps": test_case.get("steps"),
            "expected_result": test_case.get("expected_result"),
            "meta_attributes": attrs,
        }
        try:
            validated = BulkTestCaseCandidate.model_validate(candidate)
        except Exception:
            return None

        normalized_title = " ".join(validated.title.strip().lower().split())
        normalized_signature = " ".join(
            [
                validated.testing_type.value,
                validated.title,
                validated.preconditions,
                validated.test_data,
                validated.steps,
                validated.expected_result,
            ]
        ).strip().lower()
        if normalized_title in seen_titles or normalized_signature in seen_signatures:
            return None
        seen_titles.add(normalized_title)
        seen_signatures.add(normalized_signature)
        return validated
