from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.bug import Bug
from app.models.bug_retest import BugRetest
from app.models.test_execution import TestExecution
from app.models.test_run import TestRun
from app.repositories.test_execution_repository import (
    TestExecutionRepository,
)
from app.schemas.test_execution import (
    TestExecutionCreate,
    TestExecutionUpdate,
)
from app.services.test_run_service import TestRunService


class TestExecutionService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = TestExecutionRepository(db)
        self.test_run_service = TestRunService(db)

    def get_test_executions(self):
        return self.repository.get_all()

    def get_test_execution(self, execution_id: int):
        execution = self.repository.get_by_id(execution_id)

        if not execution:
            raise HTTPException(
                status_code=404,
                detail="Test Execution not found",
            )

        return execution

    def get_execution_by_run_and_test_case(
        self,
        run_id: int,
        test_case_id: int,
    ):
        execution = (
            self.repository.get_by_run_and_test_case(
                run_id,
                test_case_id,
            )
        )

        if not execution:
            raise HTTPException(
                status_code=404,
                detail="Test Execution not found",
            )

        return execution

    def get_execution_by_token_and_test_case(
        self,
        automation_token: str,
        test_case_id: int,
    ):
        run = (
            self.db.query(TestRun)
            .filter(
                TestRun.automation_token
                == automation_token,
            )
            .first()
        )

        if not run:
            raise HTTPException(
                status_code=404,
                detail="Automation run not found",
            )

        return self.get_execution_by_run_and_test_case(
            run.id,
            test_case_id,
        )

    def get_executions_by_token(
        self,
        automation_token: str,
    ):
        run = (
            self.db.query(TestRun)
            .filter(
                TestRun.automation_token
                == automation_token,
            )
            .first()
        )

        if not run:
            raise HTTPException(
                status_code=404,
                detail="Automation run not found",
            )

        return self.repository.get_by_run_id(
            run.id
        )

    def get_or_create_executions(self, run_id: int):
        run = self.test_run_service.get_test_run(run_id)

        executions = self.repository.get_by_run_id(run_id)

        if executions:
            return executions

        for test_case in run.suite.test_cases:
            execution = TestExecution(
                run_id=run.id,
                test_case_id=test_case.id,
                status="Not Executed",
            )

            self.repository.create(execution)

        return self.repository.get_by_run_id(run_id)

    def create_test_execution(
        self,
        data: TestExecutionCreate,
    ):
        execution = TestExecution(
            run_id=data.run_id,
            test_case_id=data.test_case_id,
            status=data.status,
            actual_result=data.actual_result,
            comments=data.comments,
            executed_by=data.executed_by,
            executed_at=data.executed_at,
        )

        return self.repository.create(execution)

    def update_test_execution(
        self,
        execution_id: int,
        data: TestExecutionUpdate,
    ):
        execution = self.get_test_execution(
            execution_id
        )

        execution.status = data.status
        execution.actual_result = data.actual_result
        execution.comments = data.comments
        execution.executed_by = data.executed_by
        execution.executed_at = data.executed_at

        self._update_bug_retest_status(execution)

        updated_execution = self.repository.update(
            execution
        )

        self._update_automated_run_status(
            updated_execution
        )

        return updated_execution

    def _update_bug_retest_status(
        self,
        execution: TestExecution,
    ):
        bug_retest = (
            self.db.query(BugRetest)
            .filter(
                BugRetest.execution_id
                == execution.id,
            )
            .first()
        )

        if not bug_retest:
            return

        bug = (
            self.db.query(Bug)
            .filter(
                Bug.id
                == bug_retest.bug_id,
            )
            .first()
        )

        if not bug:
            return

        if bug.status != "Retesting":
            return

        if execution.status == "Passed":
            bug.status = "Closed"
            bug.resolution = "Fixed"

        elif execution.status == "Failed":
            bug.status = "Reopened"
            bug.resolution = None

    def _update_automated_run_status(
        self,
        execution: TestExecution,
    ):
        run = self.test_run_service.get_test_run(
            execution.run_id
        )

        if run.execution_type != "Automated":
            return

        if run.status == "Not Started":
            run.status = "In Progress"

            if run.start_date is None:
                run.start_date = (
                    datetime.now(
                        timezone.utc
                    ).date()
                )

        executions = self.repository.get_by_run_id(
            run.id
        )

        unfinished_executions = [
            item
            for item in executions
            if item.status
            not in {
                "Passed",
                "Failed",
                "Blocked",
            }
        ]

        if executions and not unfinished_executions:
            run.status = "Completed"

            if run.end_date is None:
                run.end_date = (
                    datetime.now(
                        timezone.utc
                    ).date()
                )

        self.db.commit()
        self.db.refresh(run)

    def get_execution_summary(
        self,
        run_id: int,
    ):
        executions = self.repository.get_by_run_id(
            run_id
        )

        total = len(executions)

        passed = len(
            [
                e
                for e in executions
                if e.status == "Passed"
            ]
        )

        failed = len(
            [
                e
                for e in executions
                if e.status == "Failed"
            ]
        )

        blocked = len(
            [
                e
                for e in executions
                if e.status == "Blocked"
            ]
        )

        not_executed = len(
            [
                e
                for e in executions
                if e.status == "Not Executed"
            ]
        )

        pass_percentage = (
            round(
                (passed / total) * 100,
                2,
            )
            if total > 0
            else 0
        )

        return {
            "total": total,
            "passed": passed,
            "failed": failed,
            "blocked": blocked,
            "not_executed": not_executed,
            "pass_percentage": pass_percentage,
        }

    def delete_test_execution(
        self,
        execution_id: int,
    ):
        execution = self.get_test_execution(
            execution_id
        )

        self.repository.delete(execution)