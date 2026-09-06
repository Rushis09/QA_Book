import hashlib
import secrets

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
from app.automation.services.github_api_service import GitHubAPIService
from app.models.admin import Admin
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

    def generate_ci_secret(
        self,
        automation_project_id: int,
        commit: bool = True,
    ) -> str:
        """
        Generate a new CI authentication secret.

        Only the SHA-256 hash is stored in QABook.

        When commit=False, the caller owns the transaction.
        """
        automation_project = self.get_by_id(
            automation_project_id
        )

        raw_secret = secrets.token_urlsafe(48)

        automation_project.ci_secret_hash = (
            self._hash_ci_secret(raw_secret)
        )

        self.db.flush()

        if commit:
            self.db.commit()
            self.db.refresh(automation_project)

        return raw_secret

    def verify_ci_secret(
        self,
        automation_project_id: int,
        provided_secret: str,
    ) -> AutomationProject:
        """
        Authenticate a GitHub Actions request.

        The supplied secret is hashed and compared with the
        stored SHA-256 hash.
        """
        if not provided_secret:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="QABook CI secret is required.",
            )

        automation_project = self.get_by_id(
            automation_project_id
        )

        if not automation_project.ci_secret_hash:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="QABook CI secret is not configured.",
            )

        provided_hash = self._hash_ci_secret(
            provided_secret
        )

        if not secrets.compare_digest(
            provided_hash,
            automation_project.ci_secret_hash,
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid QABook CI secret.",
            )

        return automation_project

    @staticmethod
    def _hash_ci_secret(
        secret: str,
    ) -> str:
        return hashlib.sha256(
            secret.encode("utf-8")
        ).hexdigest()

    def start_automation_run(
        self,
        automation_project_id: int,
        admin: Admin,
    ):
        try:
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

            if not automation_project.repository_url:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="GitHub repository is not connected",
                )

            github_connection = automation_project.github_connection

            if not github_connection:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="GitHub connection is not configured",
                )

            if not github_connection.github_access_token:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="GitHub access token is not available",
                )

            repository_path = (
                automation_project.repository_url
                .rstrip("/")
                .split("github.com/")[-1]
            )

            repository_parts = repository_path.split("/", 1)

            if len(repository_parts) != 2:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid GitHub repository URL",
                )

            repository_owner = repository_parts[0]
            repository_name = repository_parts[1]

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

            suite = self.test_suite_repository.create(
                suite,
                commit=False,
            )

            suite = self.test_suite_repository.assign_test_cases(
                suite,
                test_cases,
                commit=False,
            )

            run = self.test_run_service.create_test_run_pending_commit(
                self._build_test_run_data(
                    suite.id,
                    automation_project.name,
                )
            )

            executions = (
                self.test_execution_service.get_or_create_executions(
                    run.id,
                    admin,
                )
            )

            self.db.commit()

            github_api_service = GitHubAPIService()

            github_api_service.dispatch_repository_event(
                user_access_token=github_connection.github_access_token,
                repository_owner=repository_owner,
                repository_name=repository_name,
                event_type="qabook-automation-run",
                client_payload={
                    "run_id": run.id,
                },
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

        except Exception:
            self.db.rollback()
            raise

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