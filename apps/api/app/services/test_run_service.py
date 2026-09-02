from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.test_run import TestRun
from app.repositories.test_run_repository import TestRunRepository
from app.schemas.test_run import (
    TestRunCreate,
    TestRunUpdate,
)


class TestRunService:
    def __init__(self, db: Session):
        self.repository = TestRunRepository(db)

    def get_test_runs(
        self,
        project_id: int,
    ):
        return self.repository.get_all(project_id)

    def get_test_run(
        self,
        test_run_id: int,
    ):
        test_run = self.repository.get_by_id(
            test_run_id,
        )

        if not test_run:
            raise HTTPException(
                status_code=404,
                detail="Test Run not found",
            )

        return test_run


    def get_test_run_by_code(
        self,
        run_code: str,
    ):
        test_run = self.repository.get_by_run_code(
            run_code,
        )

        if not test_run:
            raise HTTPException(
                status_code=404,
                detail="Test Run not found",
            )

        return test_run

    def create_test_run(
        self,
        data: TestRunCreate,
    ):
        latest_code = (
            self.repository.db.query(
                func.max(TestRun.run_code)
            )
            .scalar()
        )

        if not latest_code:
            next_number = 1
        else:
            numeric_part = int(
                latest_code.replace("TR-", "")
            )
            next_number = numeric_part + 1

        run_code = f"TR-{next_number:03d}"

        run = TestRun(
            run_code=run_code,
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

        return self.repository.create(run)

    def update_test_run(
        self,
        test_run_id: int,
        data: TestRunUpdate,
    ):
        run = self.get_test_run(
            test_run_id,
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
    ):
        run = self.get_test_run(
            test_run_id,
        )

        run.status = "Completed"
        run.end_date = datetime.now(
            timezone.utc
        ).date()

        return self.repository.update(run)

    def delete_test_run(
        self,
        test_run_id: int,
    ):
        run = self.get_test_run(
            test_run_id,
        )

        self.repository.delete(run)