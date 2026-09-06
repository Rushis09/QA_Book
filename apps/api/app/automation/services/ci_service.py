from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.automation.models.automation_project import AutomationProject
from app.automation.repositories.automation_test_mapping_repository import (
    AutomationTestMappingRepository,
)
from app.automation.services.automation_project_service import (
    AutomationProjectService,
)
from app.automation.schemas.ci import CIRunRequest
from app.schemas.test_run import TestRunCreate
from app.services.test_execution_service import TestExecutionService
from app.services.test_run_service import TestRunService


class CIService:
    def __init__(self, db: Session):
        self.db = db
        self.automation_project_service = AutomationProjectService(db)
        self.mapping_repository = AutomationTestMappingRepository(db)
        self.test_run_service = TestRunService(db)
        self.test_execution_service = TestExecutionService(db)

    def create_ci_run(
        self,
        data: CIRunRequest,
        provided_secret: str,
    ):
        automation_project = (
            self.automation_project_service.verify_ci_secret(
                data.automation_project_id,
                provided_secret,
            )
        )

        self._validate_repository(
            automation_project,
            data.repository,
        )

        mappings = (
            self.mapping_repository.get_by_automation_project(
                data.automation_project_id
            )
        )

        if not mappings:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No automated test cases are mapped to this automation project.",
            )

        test_files = [
            mapping.test_file_path
            for mapping in mappings
            if mapping.test_file_path
        ]

        if not test_files:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No automated test files are configured for this automation project.",
            )

        if data.retest_run_id is not None:
            return self._prepare_retest_run(
                automation_project,
                data,
                test_files,
            )

        return self._create_push_run(
            automation_project,
            data,
            mappings,
            test_files,
        )

    def _create_push_run(
        self,
        automation_project: AutomationProject,
        data: CIRunRequest,
        mappings,
        test_files: list[str],
    ):
        project = automation_project.project

        test_suite = self._get_or_create_ci_suite(
            project.id,
            automation_project,
            mappings,
        )

        test_run = self.test_run_service.create_test_run_pending_commit(
            TestRunCreate(
                suite_id=test_suite.id,
                name=f"CI Run {data.commit_sha[:7]}",
                build_version=data.commit_sha,
                environment="CI",
                tester="GitHub Actions",
                status="Not Started",
                execution_type="Automated",
            )
        )

        self.db.flush()

        self.test_execution_service.get_or_create_executions(
            test_run.id
        )

        self.db.commit()
        self.db.refresh(test_run)

        return {
            "test_run_id": test_run.id,
            "automation_token": test_run.automation_token,
            "test_files": test_files,
        }

    def _prepare_retest_run(
        self,
        automation_project: AutomationProject,
        data: CIRunRequest,
        test_files: list[str],
    ):
        test_run = self.test_run_service.get_test_run(
            data.retest_run_id
        )

        if test_run.execution_type != "Automated":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Retest Test Run must be Automated.",
            )

        if not test_run.automation_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Retest Test Run does not have an automation token.",
            )

        execution = self.test_execution_service.get_executions_by_token(
            test_run.automation_token
        )

        if len(execution) != 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Retest Test Run must contain exactly one test execution.",
            )

        return {
            "test_run_id": test_run.id,
            "automation_token": test_run.automation_token,
            "test_files": test_files_for_retest(
                execution[0].test_case_id,
                self.mapping_repository,
                automation_project.id,
            ),
        }

    def _get_or_create_ci_suite(
        self,
        project_id: int,
        automation_project: AutomationProject,
        mappings,
    ):
        from app.models.test_suite import TestSuite

        suite = (
            self.db.query(TestSuite)
            .filter(
                TestSuite.project_id == project_id,
                TestSuite.name == "CI Automation Suite",
            )
            .first()
        )

        if not suite:
            suite = TestSuite(
                suite_code=self._generate_suite_code(),
                project_id=project_id,
                name="CI Automation Suite",
                description="Automatically managed suite for GitHub Actions CI runs.",
            )
            self.db.add(suite)
            self.db.flush()

        test_case_ids = [
            mapping.test_case_id
            for mapping in mappings
        ]

        test_cases = [
            mapping.test_case
            for mapping in mappings
            if mapping.test_case_id in test_case_ids
        ]

        suite.test_cases = test_cases
        self.db.flush()

        return suite

    def _generate_suite_code(self):
        from app.utils.code_generator import generate_sequential_code

        return generate_sequential_code(
            db=self.db,
            entity_type="test_suite",
            prefix="TS",
        )

    @staticmethod
    def _validate_repository(
        automation_project: AutomationProject,
        repository: str,
    ):
        if not automation_project.repository_url:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Automation project is not connected to a GitHub repository.",
            )

        expected_repository = (
            automation_project.repository_url
            .rstrip("/")
            .split("github.com/")[-1]
        )

        if expected_repository != repository:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="GitHub repository does not belong to this automation project.",
            )


def test_files_for_retest(
    test_case_id: int,
    mapping_repository: AutomationTestMappingRepository,
    automation_project_id: int,
):
    mappings = mapping_repository.get_by_automation_project(
        automation_project_id
    )

    for mapping in mappings:
        if mapping.test_case_id == test_case_id:
            if not mapping.test_file_path:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Retest test case has no automated test file.",
                )

            return [mapping.test_file_path]

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Retest test case is not mapped to this automation project.",
    )