import secrets

from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.admin import Admin
from app.models.project import Project
from app.models.test_run import TestRun
from app.models.test_suite import TestSuite
from app.repositories.test_run_repository import TestRunRepository
from app.schemas.test_run import (
    TestRunCreate,
    TestRunUpdate,
)
from app.utils.code_generator import generate_sequential_code


class TestRunService:
    def __init__(self, db: Session):
        self.repository = TestRunRepository(db)

    def get_test_runs(
        self,
        project_id: int | None,
        admin: Admin,
    ):
        if project_id is not None:
            self._validate_project_access(
                project_id,
                admin,
            )
            return self.repository.get_all(
                project_id
            )

        if admin.role == "PLATFORM_ADMIN":
            return self.repository.get_all()

        return self.repository.get_by_owner(
            admin.id
        )

    def get_test_run(self, test_run_id: int, admin: Admin | None = None):
        test_run = self.repository.get_by_id(test_run_id)
        if not test_run:
            raise HTTPException(status_code=404, detail="Test Run not found")
    
        if admin is not None:
            self._validate_run_access(test_run, admin)
    
        return test_run

    def get_test_run_by_code(
        self,
        run_code: str,
        admin: Admin,
    ):
        test_run = self.repository.get_by_run_code(
            run_code,
        )

        if not test_run:
            raise HTTPException(
                status_code=404,
                detail="Test Run not found",
            )


        if admin:

            self._validate_run_access(
            test_run,
            admin,
        )

        return test_run

    def create_test_run(
        self,
        data: TestRunCreate,
        admin: Admin,
    ):
        self._validate_suite_access(
            data.suite_id,
            admin,
        )

        run = self.create_test_run_pending_commit(
            data
        )

        return self.repository.create(run)

    def create_test_run_pending_commit(
        self,
        data: TestRunCreate,
    ):
        run_code = generate_sequential_code(
            db=self.repository.db,
            entity_type="test_run",
            prefix="TR",
        )

        automation_token = None

        if data.execution_type == "Automated":
            automation_token = secrets.token_urlsafe(
                48
            )

        run = TestRun(
            run_code=run_code,
            automation_token=automation_token,
            suite_id=data.suite_id,
            name=data.name,
            build_version=data.build_version,
            environment=data.environment,
            tester=data.tester,
            start_date=data.start_date,
            end_date=data.end_date,
            status=data.status,
            execution_type=data.execution_type,
        )

        self.repository.db.add(run)
        self.repository.db.flush()

        return run

    def update_test_run(
        self,
        test_run_id: int,
        data: TestRunUpdate,
        admin: Admin,
    ):
        run = self.get_test_run(
            test_run_id,
            admin,
        )

        self._validate_suite_access(
            data.suite_id,
            admin,
        )

        run.suite_id = data.suite_id
        run.name = data.name
        run.build_version = data.build_version
        run.environment = data.environment
        run.tester = data.tester
        run.start_date = data.start_date
        run.end_date = data.end_date
        run.status = data.status
        run.execution_type = data.execution_type

        return self.repository.update(run)

    def finish_test_run(
        self,
        test_run_id: int,
        admin: Admin,
    ):
        run = self.get_test_run(
            test_run_id,
            admin,
        )

        run.status = "Completed"
        run.end_date = datetime.now(
            timezone.utc
        ).date()

        return self.repository.update(run)

    def delete_test_run(
        self,
        test_run_id: int,
        admin: Admin,
    ):
        run = self.get_test_run(
            test_run_id,
            admin,
        )

        self.repository.delete(run)

    def _validate_suite_access(
        self,
        suite_id: int,
        admin: Admin,
    ):
        suite = (
            self.repository.db.query(TestSuite)
            .filter(
                TestSuite.id == suite_id
            )
            .first()
        )

        if not suite:
            raise HTTPException(
                status_code=404,
                detail="Test Suite not found",
            )

        self._validate_project_access(
            suite.project_id,
            admin,
        )

    def _validate_run_access(
        self,
        test_run: TestRun,
        admin: Admin,
    ):
        if admin.role == "PLATFORM_ADMIN":
            return

        suite = (
            self.repository.db.query(TestSuite)
            .filter(
                TestSuite.id == test_run.suite_id
            )
            .first()
        )

        if not suite:
            raise HTTPException(
                status_code=404,
                detail="Test Suite not found",
            )

        self._validate_project_access(
            suite.project_id,
            admin,
        )

    def _validate_project_access(
        self,
        project_id: int,
        admin: Admin,
    ):
        project = (
            self.repository.db.query(Project)
            .filter(
                Project.id == project_id
            )
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