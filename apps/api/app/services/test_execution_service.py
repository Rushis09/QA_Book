from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.test_execution import TestExecution
from app.repositories.test_execution_repository import (
    TestExecutionRepository,
)
from app.schemas.test_execution import (
    TestExecutionCreate,
    TestExecutionUpdate,
)
from app.models.test_case import TestCase
from app.services.test_run_service import TestRunService


class TestExecutionService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = TestExecutionRepository(db)
        self.test_run_service = TestRunService(db)


    def get_test_executions(self):
        return self.repository.get_all()

    def get_test_execution(
        self,
        execution_id: int,
    ):
        execution = self.repository.get_by_id(
            execution_id,
        )

        if not execution:
            raise HTTPException(
                status_code=404,
                detail="Test Execution not found",
            )

        return execution
    
    def get_or_create_executions(
        self,
        run_id: int,
    ):
        run = self.test_run_service.get_test_run(
            run_id,
        )

        executions = (
            self.repository.get_by_run_id(
                run_id,
            )
        )

        if executions:
            return executions

        for test_case in run.suite.test_cases:
            execution = TestExecution(
                run_id=run.id,
                test_case_id=test_case.id,
                status="Not Executed",
            )

            self.repository.create(execution)

        return self.repository.get_by_run_id(
            run_id,
        )

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
            execution_id,
        )

        execution.run_id = data.run_id
        execution.test_case_id = data.test_case_id
        execution.status = data.status
        execution.actual_result = (
            data.actual_result
        )
        execution.comments = data.comments
        execution.executed_by = (
            data.executed_by
        )
        execution.executed_at = (
            data.executed_at
        )

        return self.repository.update(
            execution,
        )


    def get_execution_summary(
        self,
        run_id: int,
    ):
        executions = (
            self.repository.get_by_run_id(
                run_id,
            )
        )

        total = len(executions)

        passed = len(
            [
                execution
                for execution in executions
                if execution.status == "Passed"
            ]
        )

        failed = len(
            [
                execution
                for execution in executions
                if execution.status == "Failed"
            ]
        )

        blocked = len(
            [
                execution
                for execution in executions
                if execution.status == "Blocked"
            ]
        )

        not_executed = len(
            [
                execution
                for execution in executions
                if execution.status == "Not Executed"
            ]
        )

        pass_percentage = (
            round((passed / total) * 100, 2)
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
            execution_id,
        )

        self.repository.delete(execution)