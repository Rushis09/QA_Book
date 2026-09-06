from app.models.admin import Admin
from app.models.project import Project
from app.models.requirement import Requirement
from app.models.test_case import TestCase
from app.models.test_scenario import TestScenario
from app.repositories.test_case_repository import (
    TestCaseRepository,
)
from app.schemas.test_case import (
    TestCaseCreate,
    TestCaseUpdate,
)
from app.utils.code_generator import generate_sequential_code


class TestCaseService:
    def __init__(
        self,
        repository: TestCaseRepository,
    ):
        self.repository = repository

    def create(
        self,
        test_case_data: TestCaseCreate,
        admin: Admin,
    ):
        scenario = (
            self.repository.session.query(
                TestScenario
            )
            .filter(
                TestScenario.id
                == test_case_data.scenario_id
            )
            .first()
        )

        if not scenario:
            raise ValueError(
                "Test Scenario not found"
            )

        self._validate_scenario_access(
            scenario=scenario,
            admin=admin,
        )

        test_case_code = generate_sequential_code(
            db=self.repository.session,
            entity_type="test_case",
            prefix="TC",
        )

        test_case = TestCase(
            test_case_code=test_case_code,
            scenario_id=(
                test_case_data.scenario_id
            ),
            module=test_case_data.module,
            priority=test_case_data.priority,
            status=test_case_data.status,
            automation_eligibility=(
                test_case_data.automation_eligibility
            ),
            automation_status=(
                test_case_data.automation_status
            ),
            title=test_case_data.title,
            description=test_case_data.description,
            preconditions=(
                test_case_data.preconditions
            ),
            test_data=test_case_data.test_data,
            steps=test_case_data.steps,
            expected_result=(
                test_case_data.expected_result
            ),
        )

        created = self.repository.create(
            test_case
        )

        return self.repository.get_by_id(
            created.id
        )

    def get_all(
        self,
        project_id: int | None,
        admin: Admin,
    ):
        if project_id is not None:
            self._validate_project_access(
                project_id=project_id,
                admin=admin,
            )

            return self.repository.get_all(
                project_id,
            )

        if admin.role == "PLATFORM_ADMIN":
            return self.repository.get_all()

        return self.repository.get_by_owner(
            admin.id
        )

    def get_by_id(
        self,
        test_case_id: int,
        admin: Admin,
    ):
        test_case = self.repository.get_by_id(
            test_case_id
        )

        if test_case is None:
            return None

        self._validate_test_case_access(
            test_case=test_case,
            admin=admin,
        )

        return test_case

    def update(
        self,
        test_case: TestCase,
        test_case_data: TestCaseUpdate,
        admin: Admin,
    ):
        self._validate_test_case_access(
            test_case=test_case,
            admin=admin,
        )

        scenario = (
            self.repository.session.query(
                TestScenario
            )
            .filter(
                TestScenario.id
                == test_case_data.scenario_id
            )
            .first()
        )

        if not scenario:
            raise ValueError(
                "Test Scenario not found"
            )

        self._validate_scenario_access(
            scenario=scenario,
            admin=admin,
        )

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
        test_case.automation_eligibility = (
            test_case_data.automation_eligibility
        )
        test_case.automation_status = (
            test_case_data.automation_status
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
        admin: Admin,
    ):
        self._validate_test_case_access(
            test_case=test_case,
            admin=admin,
        )

        self.repository.delete(
            test_case
        )

    def _validate_project_access(
        self,
        project_id: int,
        admin: Admin,
    ):
        project = (
            self.repository.session.query(
                Project
            )
            .filter(
                Project.id == project_id
            )
            .first()
        )

        if project is None:
            raise ValueError(
                "Project not found"
            )

        if (
            admin.role != "PLATFORM_ADMIN"
            and project.admin_id != admin.id
        ):
            raise ValueError(
                "You do not have access to this project."
            )

    def _validate_scenario_access(
        self,
        scenario: TestScenario,
        admin: Admin,
    ):
        if admin.role == "PLATFORM_ADMIN":
            return

        requirement = (
            self.repository.session.query(
                Requirement
            )
            .filter(
                Requirement.id
                == scenario.requirement_id
            )
            .first()
        )

        if requirement is None:
            raise ValueError(
                "Requirement not found"
            )

        self._validate_requirement_access(
            requirement=requirement,
            admin=admin,
        )

    def _validate_requirement_access(
        self,
        requirement: Requirement,
        admin: Admin,
    ):
        if admin.role == "PLATFORM_ADMIN":
            return

        project = (
            self.repository.session.query(
                Project
            )
            .filter(
                Project.id
                == requirement.project_id
            )
            .first()
        )

        if (
            project is None
            or project.admin_id != admin.id
        ):
            raise ValueError(
                "You do not have access to this requirement."
            )

    def _validate_test_case_access(
        self,
        test_case: TestCase,
        admin: Admin,
    ):
        if admin.role == "PLATFORM_ADMIN":
            return

        scenario = (
            self.repository.session.query(
                TestScenario
            )
            .filter(
                TestScenario.id
                == test_case.scenario_id
            )
            .first()
        )

        if scenario is None:
            raise ValueError(
                "Test Scenario not found"
            )

        self._validate_scenario_access(
            scenario=scenario,
            admin=admin,
        )