from datetime import datetime
from fastapi import HTTPException
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

    def get_test_runs(self):
        return self.repository.get_all()

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

    def create_test_run(
        self,
        data: TestRunCreate,
    ):
        last_run = self.repository.get_last()

        next_number = 1

        if last_run:
            next_number = last_run.id + 1

        run = TestRun(
            run_code=f"TR-{next_number:03d}",
            suite_id=data.suite_id,
            name=data.name,
            build_version=data.build_version,
            environment=data.environment,
            tester=data.tester,
            start_date=data.start_date,
            end_date=data.end_date,
            status=data.status,
        )

        created = self.repository.create(run)

        print("========== DEBUG ==========")
        print("Run ID:", created.id)
        print("Suite ID:", created.suite_id)
        print("Suite Object:", created.suite)
        print("===========================")

        return created

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

        return self.repository.update(run)
    
    def finish_test_run(
        self,
        test_run_id: int,
    ):
        run = self.get_test_run(
            test_run_id,
        )

        run.status = "Completed"
        run.end_date = datetime.utcnow()

        return self.repository.update(run)

    def delete_test_run(
        self,
        test_run_id: int,
    ):
        run = self.get_test_run(
            test_run_id,
        )

        self.repository.delete(run)