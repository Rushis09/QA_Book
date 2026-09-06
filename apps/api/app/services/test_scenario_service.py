from app.models.admin import Admin
from app.models.project import Project
from app.models.requirement import Requirement
from app.models.test_scenario import TestScenario
from app.repositories.test_scenario_repository import (
    TestScenarioRepository,
)
from app.schemas.test_scenario import (
    TestScenarioCreate,
    TestScenarioUpdate,
)
from app.utils.code_generator import generate_sequential_code


class TestScenarioService:
    def __init__(
        self,
        repository: TestScenarioRepository,
    ):
        self.repository = repository

    def create(
        self,
        test_scenario_data: TestScenarioCreate,
        admin: Admin,
    ):
        requirement = (
            self.repository.session.query(
                Requirement
            )
            .filter(
                Requirement.id
                == test_scenario_data.requirement_id
            )
            .first()
        )

        if not requirement:
            raise ValueError(
                "Requirement not found"
            )

        self._validate_requirement_access(
            requirement=requirement,
            admin=admin,
        )

        scenario_code = generate_sequential_code(
            db=self.repository.session,
            entity_type="scenario",
            prefix="SCN",
        )

        test_scenario = TestScenario(
            scenario_code=scenario_code,
            requirement_id=(
                test_scenario_data.requirement_id
            ),
            module=test_scenario_data.module,
            title=test_scenario_data.title,
            description=(
                test_scenario_data.description
            ),
            priority=test_scenario_data.priority,
            status=test_scenario_data.status,
        )

        created = self.repository.create(
            test_scenario
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
                project_id
            )

        if admin.role == "PLATFORM_ADMIN":
            return self.repository.get_all()

        return self.repository.get_by_owner(
            admin.id
        )

    def get_by_id(
        self,
        test_scenario_id: int,
        admin: Admin,
    ):
        test_scenario = (
            self.repository.get_by_id(
                test_scenario_id
            )
        )

        if test_scenario is None:
            return None

        self._validate_scenario_access(
            test_scenario=test_scenario,
            admin=admin,
        )

        return test_scenario

    def update(
        self,
        test_scenario: TestScenario,
        test_scenario_data: TestScenarioUpdate,
        admin: Admin,
    ):
        self._validate_scenario_access(
            test_scenario=test_scenario,
            admin=admin,
        )

        requirement = (
            self.repository.session.query(
                Requirement
            )
            .filter(
                Requirement.id
                == test_scenario_data.requirement_id
            )
            .first()
        )

        if not requirement:
            raise ValueError(
                "Requirement not found"
            )

        self._validate_requirement_access(
            requirement=requirement,
            admin=admin,
        )

        test_scenario.requirement_id = (
            test_scenario_data.requirement_id
        )
        test_scenario.module = (
            test_scenario_data.module
        )
        test_scenario.title = (
            test_scenario_data.title
        )
        test_scenario.description = (
            test_scenario_data.description
        )
        test_scenario.priority = (
            test_scenario_data.priority
        )
        test_scenario.status = (
            test_scenario_data.status
        )

        self.repository.session.commit()

        return self.repository.get_by_id(
            test_scenario.id
        )

    def delete(
        self,
        test_scenario: TestScenario,
        admin: Admin,
    ):
        self._validate_scenario_access(
            test_scenario=test_scenario,
            admin=admin,
        )

        self.repository.delete(
            test_scenario
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

    def _validate_scenario_access(
        self,
        test_scenario: TestScenario,
        admin: Admin,
    ):
        if admin.role == "PLATFORM_ADMIN":
            return

        requirement = test_scenario.requirement

        if requirement is None:
            raise ValueError(
                "Requirement not found"
            )

        self._validate_requirement_access(
            requirement=requirement,
            admin=admin,
        )