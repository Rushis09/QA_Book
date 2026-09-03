
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.automation.models.automation_project import AutomationProject
from app.automation.repositories.automation_project_repository import (
    AutomationProjectRepository,
)
from app.automation.schemas.automation_project import (
    AutomationProjectCreate,
    AutomationProjectUpdate,
)
from app.models.test_run import TestRun
from app.models.test_suite import TestSuite
from app.repositories.test_suite_repository import TestSuiteRepository
from app.services.test_execution_service import TestExecutionService
from app.services.test_run_service import TestRunService
from app.utils.code_generator import generate_sequential_code


class AutomationProjectService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = AutomationProjectRepository(db)
        self.test_suite_repository = TestSuiteRepository(db)
        self.test_run_service = TestRunService(db)
        self.test_execution_service = TestExecutionService(db)

    def create(self, data: AutomationProjectCreate):
        existing = self.repository.get_by_project_id(data.project_id)

        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Automation project already exists for this project",
            )

        automation_project = AutomationProject(
            project_id=data.project_id,
            name=data.name,
            framework=data.framework,
            status=data.status,
            repository_url=data.repository_url,
        )

        return self.repository.create(automation_project)

    def get_by_project_id(self, project_id: int):
        automation_project = self.repository.get_by_project_id(project_id)

        if not automation_project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Automation project not found",
            )

        return automation_project

    def get_by_id(self, automation_project_id: int):
        automation_project = self.repository.get_by_id(
            automation_project_id
        )

        if not automation_project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Automation project not found",
            )

        return automation_project

    def update(
        self,
        automation_project_id: int,
        data: AutomationProjectUpdate,
    ):
        automation_project = self.repository.get_by_id(
            automation_project_id
        )

        if not automation_project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Automation project not found",
            )

        automation_project.name = data.name
        automation_project.framework = data.framework
        automation_project.status = data.status
        automation_project.repository_url = data.repository_url

        return self.repository.update(automation_project)

    def delete(self, automation_project_id: int):
        automation_project = self.repository.get_by_id(
            automation_project_id
        )

        if not automation_project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Automation project not found",
            )

        self.repository.delete(automation_project)

    def start_automation_run(
        self,
        automation_project_id: int,
    ):
        automation_project = self.get_by_id(
            automation_project_id
        )

        mappings = automation_project.mappings

        if not mappings:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No automation test cases are mapped",
            )

        test_case_ids = [
            mapping.test_case_id
            for mapping in mappings
        ]

        test_cases = (
            self.test_suite_repository.get_test_cases_by_ids(
                test_case_ids
            )
        )

        if not test_cases:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No mapped test cases found",
            )

        suite = TestSuite(
            suite_code=self._generate_suite_code(),
            project_id=automation_project.project_id,
            name=f"{automation_project.name} Automation",
            description=(
                "Automatically created test suite "
                "for automation execution."
            ),
            status="Active",
        )

        suite = self.test_suite_repository.create(suite)

        suite = self.test_suite_repository.assign_test_cases(
            suite,
            test_cases,
        )

        run = self.test_run_service.create_test_run(
            data=self._build_test_run_data(
                suite.id,
                automation_project.name,
            )
        )

        executions = (
            self.test_execution_service.get_or_create_executions(
                run.id
            )
        )

        return {
            "automation_project_id": automation_project.id,
            "suite_id": suite.id,
            "suite_code": suite.suite_code,
            "test_run_id": run.id,
            "run_code": run.run_code,
            "automation_token": run.automation_token,
            "test_case_ids": test_case_ids,
            "execution_ids": [
                execution.id
                for execution in executions
            ],
        }

    def _generate_suite_code(self) -> str:
        return generate_sequential_code(
            db=self.db,
            entity_type="test_suite",
            prefix="TS",
        )

    @staticmethod
    def _build_test_run_data(
        suite_id: int,
        automation_project_name: str,
    ):
        from app.schemas.test_run import TestRunCreate

        return TestRunCreate(
            suite_id=suite_id,
            name=f"{automation_project_name} Automation Run",
            status="Not Started",
            execution_type="Automated",
        )
