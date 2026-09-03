from fastapi import HTTPException

from app.models.test_suite import TestSuite
from app.repositories.test_suite_repository import TestSuiteRepository
from app.schemas.suite_assignment import SuiteAssignmentRequest
from app.schemas.test_suite import (
    TestSuiteCreate,
    TestSuiteUpdate,
)
from app.utils.code_generator import generate_sequential_code


class TestSuiteService:
    def __init__(self, repository: TestSuiteRepository):
        self.repository = repository

    def create(self, test_suite_data: TestSuiteCreate):
        suite_code = generate_sequential_code(
            db=self.repository.session,
            entity_type="test_suite",
            prefix="TS",
        )

        test_suite = TestSuite(
            suite_code=suite_code,
            project_id=test_suite_data.project_id,
            name=test_suite_data.name,
            description=test_suite_data.description,
            status=test_suite_data.status,
        )

        return self.repository.create(test_suite)

    def get_all(
        self,
        project_id: int,
    ):
        return self.repository.get_all(project_id)

    def get_by_id(self, test_suite_id: int):
        test_suite = self.repository.get_by_id(test_suite_id)

        if not test_suite:
            raise HTTPException(
                status_code=404,
                detail="Test Suite not found",
            )

        return test_suite

    def update(
        self,
        test_suite_id: int,
        test_suite_data: TestSuiteUpdate,
    ):
        test_suite = self.get_by_id(test_suite_id)

        test_suite.project_id = test_suite_data.project_id
        test_suite.name = test_suite_data.name
        test_suite.description = test_suite_data.description
        test_suite.status = test_suite_data.status

        return self.repository.update(test_suite)

    def assign_test_cases(
        self,
        test_suite_id: int,
        assignment: SuiteAssignmentRequest,
    ):
        test_suite = self.get_by_id(test_suite_id)

        test_cases = self.repository.get_test_cases_by_ids(
            assignment.test_case_ids,
        )

        return self.repository.assign_test_cases(
            test_suite,
            test_cases,
        )

    def delete(self, test_suite_id: int):
        test_suite = self.get_by_id(test_suite_id)

        self.repository.delete(test_suite)

        return {
            "message": "Test Suite deleted successfully",
        }