from app.models.test_case import TestCase
from app.repositories.test_case_repository import (
    TestCaseRepository,
)
from app.schemas.test_case import (
    TestCaseCreate,
    TestCaseUpdate,
)


class TestCaseService:
    def __init__(
        self,
        repository: TestCaseRepository,
    ):
        self.repository = repository

    def create(
        self,
        test_case_data: TestCaseCreate,
    ):
        last_test_case = (
            self.repository.session.query(TestCase)
            .order_by(TestCase.id.desc())
            .first()
        )

        next_number = 1

        if last_test_case:
            next_number = last_test_case.id + 1

        test_case_code = f"TC-{next_number:03d}"

        test_case = TestCase(
            test_case_code=test_case_code,
            scenario_id=test_case_data.scenario_id,
            module=test_case_data.module,
            priority=test_case_data.priority,
            status=test_case_data.status,
            title=test_case_data.title,
            description=test_case_data.description,
            preconditions=test_case_data.preconditions,
            test_data=test_case_data.test_data,
            steps=test_case_data.steps,
            expected_result=test_case_data.expected_result,
        )

        created = self.repository.create(
            test_case
        )

        return self.repository.get_by_id(
            created.id
        )

    def get_all(
        self,
        project_id: int | None = None,
    ):
        return self.repository.get_all(
            project_id,
        )

    def get_by_id(
        self,
        test_case_id: int,
    ):
        return self.repository.get_by_id(
            test_case_id,
        )

    def update(
        self,
        test_case: TestCase,
        test_case_data: TestCaseUpdate,
    ):
        test_case.scenario_id = (
            test_case_data.scenario_id
        )
        test_case.module = (
            test_case_data.module
        )
        test_case.priority = (
            test_case_data.priority
        )
        test_case.status = (
            test_case_data.status
        )
        test_case.title = (
            test_case_data.title
        )
        test_case.description = (
            test_case_data.description
        )
        test_case.preconditions = (
            test_case_data.preconditions
        )
        test_case.test_data = (
            test_case_data.test_data
        )
        test_case.steps = (
            test_case_data.steps
        )
        test_case.expected_result = (
            test_case_data.expected_result
        )

        self.repository.session.commit()

        return self.repository.get_by_id(
            test_case.id
        )

    def delete(
        self,
        test_case: TestCase,
    ):
        self.repository.delete(test_case)