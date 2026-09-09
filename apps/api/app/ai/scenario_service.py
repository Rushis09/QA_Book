from sqlalchemy.orm import Session

from app.ai.credential_service import AICredentialService
from app.ai.prompts.scenarios import (
    build_bulk_scenario_prompt,
    build_scenario_prompt,
)
from app.ai.schemas import (
    BulkScenarioCandidate,
    BulkScenarioGenerationResponse,
    BulkScenarioResult,
)
from app.ai.service import AIService
from app.models.admin import Admin
from app.models.requirement import Requirement
from app.repositories.requirement_repository import (
    RequirementRepository,
)


class AIScenarioService:
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

        self.requirement_repository = (
            RequirementRepository(db)
        )

    # ============================================================
    # Single Requirement Generation
    # ============================================================

    def _generate_for_requirement(
        self,
        requirement,
        number_of_scenarios: int,
        manual_description: str,
    ):
        prompt = build_scenario_prompt(
            requirement_code=(
                requirement.requirement_code
            ),
            requirement_module=(
                requirement.module
            ),
            requirement_description=(
                requirement.description
            ),
            manual_description=(
                manual_description
            ),
            number_of_scenarios=(
                number_of_scenarios
            ),
        )

        return self.ai_service.generate_json(
            prompt
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

            generated_scenarios = []

            for requirement in requirements:
                generated_scenarios.extend(
                    self._generate_for_requirement(
                        requirement=requirement,
                        number_of_scenarios=(
                            number_of_scenarios
                        ),
                        manual_description=(
                            manual_description
                        ),
                    )
                )

            return generated_scenarios

        if requirement_id is None:
            raise ValueError(
                "Requirement is required when "
                "generate_for_all is false."
            )

        requirement = (
            self.requirement_repository.get_by_id(
                requirement_id
            )
        )

        if not requirement:
            raise ValueError(
                "Requirement not found."
            )

        if requirement.project_id != project_id:
            raise ValueError(
                "Requirement does not belong "
                "to the selected project."
            )

        return self._generate_for_requirement(
            requirement=requirement,
            number_of_scenarios=(
                number_of_scenarios
            ),
            manual_description=(
                manual_description
            ),
        )

    # ============================================================
    # Bulk Scenario Generation
    # ============================================================

    def generate_scenarios_bulk(
        self,
        project_id: int,
        requirement_ids: list[int],
        manual_description: str,
        number_of_scenarios: int,
    ) -> BulkScenarioGenerationResponse:

        unique_requirement_ids = list(
            dict.fromkeys(requirement_ids)
        )

        if not unique_requirement_ids:
            raise ValueError(
                "At least one requirement is required."
            )

        requirements = (
            self.db.query(Requirement)
            .filter(
                Requirement.id.in_(
                    unique_requirement_ids
                )
            )
            .all()
        )

        requirements_by_id = {
            requirement.id: requirement
            for requirement in requirements
        }

        missing_requirement_ids = [
            requirement_id
            for requirement_id in unique_requirement_ids
            if requirement_id
            not in requirements_by_id
        ]

        if missing_requirement_ids:
            raise ValueError(
                "One or more requirements were not found."
            )

        for requirement in requirements:
            if requirement.project_id != project_id:
                raise ValueError(
                    "One or more requirements do not "
                    "belong to the selected project."
                )

        ordered_requirements = [
            requirements_by_id[requirement_id]
            for requirement_id in unique_requirement_ids
        ]

        results: list[BulkScenarioResult] = []
        errors: list[str] = []

        for batch_start in range(
            0,
            len(ordered_requirements),
            self.BATCH_SIZE,
        ):
            batch = ordered_requirements[
                batch_start:
                batch_start + self.BATCH_SIZE
            ]

            try:
                batch_results = (
                    self._generate_scenario_batch(
                        requirements=batch,
                        manual_description=(
                            manual_description
                        ),
                        number_of_scenarios=(
                            number_of_scenarios
                        ),
                    )
                )

                results.extend(batch_results)

            except Exception as error:
                batch_requirement_codes = ", ".join(
                    requirement.requirement_code
                    for requirement in batch
                )

                errors.append(
                    "Scenario generation failed for "
                    f"requirements [{batch_requirement_codes}]: "
                    f"{error}"
                )

                for requirement in batch:
                    results.append(
                        BulkScenarioResult(
                            requirement_id=(
                                requirement.id
                            ),
                            requirement_code=(
                                requirement.requirement_code
                            ),
                            scenarios=[],
                            validation_warnings=[
                                "AI generation failed for this requirement."
                            ],
                        )
                    )

        return BulkScenarioGenerationResponse(
            project_id=project_id,
            requested_requirement_count=(
                len(unique_requirement_ids)
            ),
            processed_requirement_count=(
                len(ordered_requirements)
            ),
            results=results,
            errors=errors,
        )

    # ============================================================
    # Batch Processing
    # ============================================================

    def _generate_scenario_batch(
        self,
        requirements: list[Requirement],
        manual_description: str,
        number_of_scenarios: int,
    ) -> list[BulkScenarioResult]:

        requirement_context = [
            {
                "id": requirement.id,
                "requirement_code": (
                    requirement.requirement_code
                ),
                "module": (
                    requirement.module or ""
                ),
                "description": (
                    requirement.description or ""
                ),
            }
            for requirement in requirements
        ]

        prompt = build_bulk_scenario_prompt(
            requirements=requirement_context,
            manual_description=(
                manual_description
            ),
            number_of_scenarios=(
                number_of_scenarios
            ),
        )

        response = self.ai_service.generate_json(
            prompt
        )

        if not isinstance(response, list):
            raise ValueError(
                "AI returned an invalid bulk scenario response."
            )

        results_by_requirement_id = {
            requirement.id: BulkScenarioResult(
                requirement_id=requirement.id,
                requirement_code=(
                    requirement.requirement_code
                ),
                scenarios=[],
                validation_warnings=[],
            )
            for requirement in requirements
        }

        valid_requirement_ids = {
            requirement.id
            for requirement in requirements
        }

        for group in response:
            if not isinstance(group, dict):
                continue

            requirement_id = group.get(
                "requirement_id"
            )

            requirement_code = group.get(
                "requirement_code"
            )

            if (
                not isinstance(
                    requirement_id,
                    int,
                )
                or requirement_id
                not in valid_requirement_ids
            ):
                continue

            expected_requirement = next(
                requirement
                for requirement in requirements
                if requirement.id
                == requirement_id
            )

            if (
                requirement_code
                != expected_requirement.requirement_code
            ):
                results_by_requirement_id[
                    requirement_id
                ].validation_warnings.append(
                    "AI returned an incorrect requirement code."
                )
                continue

            scenarios = group.get(
                "scenarios",
                [],
            )

            if not isinstance(
                scenarios,
                list,
            ):
                results_by_requirement_id[
                    requirement_id
                ].validation_warnings.append(
                    "AI returned an invalid scenarios collection."
                )
                continue

            seen_titles: set[str] = set()
            seen_descriptions: set[str] = set()

            for scenario in scenarios:
                validated_candidate = (
                    self._validate_scenario_candidate(
                        scenario=scenario,
                        requirement_id=(
                            requirement_id
                        ),
                        requirement_code=(
                            requirement_code
                        ),
                        seen_titles=seen_titles,
                        seen_descriptions=(
                            seen_descriptions
                        ),
                    )
                )

                if validated_candidate is None:
                    continue

                results_by_requirement_id[
                    requirement_id
                ].scenarios.append(
                    validated_candidate
                )

        for requirement in requirements:
            result = results_by_requirement_id[
                requirement.id
            ]

            if not result.scenarios:
                result.validation_warnings.append(
                    "No valid scenarios were returned."
                )

        return [
            results_by_requirement_id[
                requirement.id
            ]
            for requirement in requirements
        ]

    # ============================================================
    # Candidate Validation
    # ============================================================

    @staticmethod
    def _validate_scenario_candidate(
        scenario,
        requirement_id: int,
        requirement_code: str,
        seen_titles: set[str],
        seen_descriptions: set[str],
    ) -> BulkScenarioCandidate | None:

        if not isinstance(
            scenario,
            dict,
        ):
            return None

        candidate = {
            "source_requirement_id": (
                requirement_id
            ),
            "source_requirement_code": (
                requirement_code
            ),
            "title": scenario.get(
                "title"
            ),
            "priority": scenario.get(
                "priority"
            ),
            "status": scenario.get(
                "status"
            ),
            "description": scenario.get(
                "description"
            ),
        }

        try:
            validated = (
                BulkScenarioCandidate.model_validate(
                    candidate
                )
            )
        except Exception:
            return None

        normalized_title = (
            validated.title
            .strip()
            .lower()
        )

        normalized_description = (
            " ".join(
                validated.description
                .strip()
                .lower()
                .split()
            )
        )

        if normalized_title in seen_titles:
            return None

        if (
            normalized_description
            in seen_descriptions
        ):
            return None

        seen_titles.add(
            normalized_title
        )

        seen_descriptions.add(
            normalized_description
        )

        return validated