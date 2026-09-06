from fastapi import HTTPException

from app.models.admin import Admin
from app.models.project import Project
from app.models.requirement import Requirement
from app.models.test_case import TestCase
from app.models.test_scenario import TestScenario
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

    def create(
        self,
        test_suite_data: TestSuiteCreate,
        admin: Admin,
    ):
        self._validate_project_access(
            test_suite_data.project_id,
            admin,
        )

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
        project_id: int | None,
        admin: Admin,
    ):
        if project_id is not None:
            self._validate_project_access(
                project_id,
                admin,
            )
            return self.repository.get_all(project_id)

        if admin.role == "PLATFORM_ADMIN":
            return self.repository.get_all()

        return self.repository.get_by_owner(admin.id)

    def get_by_id(
        self,
        test_suite_id: int,
        admin: Admin,
    ):
        test_suite = self.repository.get_by_id(
            test_suite_id
        )

        if not test_suite:
            raise HTTPException(
                status_code=404,
                detail="Test Suite not found",
            )

        self._validate_suite_access(
            test_suite,
            admin,
        )

        return test_suite

    def update(
        self,
        test_suite_id: int,
        test_suite_data: TestSuiteUpdate,
        admin: Admin,
    ):
        test_suite = self.get_by_id(
            test_suite_id,
            admin,
        )

        self._validate_project_access(
            test_suite_data.project_id,
            admin,
        )

        test_suite.project_id = (
            test_suite_data.project_id
        )
        test_suite.name = test_suite_data.name
        test_suite.description = (
            test_suite_data.description
        )
        test_suite.status = test_suite_data.status

        return self.repository.update(test_suite)

    def assign_test_cases(
        self,
        test_suite_id: int,
        assignment: SuiteAssignmentRequest,
        admin: Admin,
    ):
        test_suite = self.get_by_id(
            test_suite_id,
            admin,
        )

        test_cases = self.repository.get_test_cases_by_ids(
            assignment.test_case_ids,
        )

        if len(test_cases) != len(
            set(assignment.test_case_ids)
        ):
            raise HTTPException(
                status_code=400,
                detail="One or more test cases were not found.",
            )

        for test_case in test_cases:
            self._validate_test_case_project(
                test_case,
                test_suite.project_id,
                admin,
            )

        return self.repository.assign_test_cases(
            test_suite,
            test_cases,
        )

    def delete(
        self,
        test_suite_id: int,
        admin: Admin,
    ):
        test_suite = self.get_by_id(
            test_suite_id,
            admin,
        )

        self.repository.delete(test_suite)

        return {
            "message": "Test Suite deleted successfully",
        }

    def _validate_project_access(
        self,
        project_id: int,
        admin: Admin,
    ):
        project = (
            self.repository.session.query(Project)
            .filter(Project.id == project_id)
            .first()
        )

        if not project:
            raise HTTPException(
                status_code=404,
                detail="Project not found",
            )

        if admin.role == "PLATFORM_ADMIN":
            return

        if project.admin_id != admin.id:
            raise HTTPException(
                status_code=403,
                detail="You do not have access to this project.",
            )

    def _validate_suite_access(
        self,
        test_suite: TestSuite,
        admin: Admin,
    ):
        if admin.role == "PLATFORM_ADMIN":
            return

        project = (
            self.repository.session.query(Project)
            .filter(
                Project.id == test_suite.project_id
            )
            .first()
        )

        if not project or project.admin_id != admin.id:
            raise HTTPException(
                status_code=403,
                detail="You do not have access to this test suite.",
            )

    def _validate_test_case_project(
        self,
        test_case: TestCase,
        project_id: int,
        admin: Admin,
    ):
        scenario = (
            self.repository.session.query(TestScenario)
            .filter(
                TestScenario.id == test_case.scenario_id
            )
            .first()
        )

        if not scenario:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Test Case {test_case.test_case_code} "
                    "is linked to an invalid scenario."
                ),
            )

        requirement = (
            self.repository.session.query(Requirement)
            .filter(
                Requirement.id == scenario.requirement_id
            )
            .first()
        )

        if not requirement:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Test Case {test_case.test_case_code} "
                    "is linked to an invalid requirement."
                ),
            )

        if requirement.project_id != project_id:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Test Case {test_case.test_case_code} "
                    "does not belong to the selected project."
                ),
            )

        self._validate_project_access(
            project_id,
            admin,
        )