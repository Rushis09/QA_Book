from sqlalchemy.orm import Session, selectinload

from app.models.project import Project
from app.models.test_case import TestCase
from app.models.test_execution import TestExecution
from app.models.test_run import TestRun
from app.models.test_scenario import TestScenario
from app.models.requirement import Requirement
from app.models.test_suite import TestSuite


class TestExecutionRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return (
            self.db.query(TestExecution)
            .options(
                selectinload(TestExecution.test_run),
                selectinload(TestExecution.test_case),
            )
            .all()
        )

    def get_by_owner(
        self,
        admin_id: int,
    ):
        return (
            self.db.query(TestExecution)
            .join(
                TestRun,
                TestExecution.run_id == TestRun.id,
            )
            .join(
                TestSuite,
                TestRun.suite_id == TestSuite.id,
            )
            .join(
                Project,
                TestSuite.project_id == Project.id,
            )
            .options(
                selectinload(TestExecution.test_run),
                selectinload(TestExecution.test_case),
            )
            .filter(
                Project.admin_id == admin_id
            )
            .all()
        )

    def get_by_id(
        self,
        execution_id: int,
    ):
        return (
            self.db.query(TestExecution)
            .options(
                selectinload(TestExecution.test_run),
                selectinload(TestExecution.test_case),
            )
            .filter(
                TestExecution.id == execution_id,
            )
            .first()
        )

    def get_by_run_id(
        self,
        run_id: int,
    ):
        return (
            self.db.query(TestExecution)
            .options(
                selectinload(TestExecution.test_run),
                selectinload(TestExecution.test_case),
            )
            .filter(
                TestExecution.run_id == run_id,
            )
            .all()
        )

    def get_by_run_and_test_case(
        self,
        run_id: int,
        test_case_id: int,
    ):
        return (
            self.db.query(TestExecution)
            .options(
                selectinload(TestExecution.test_run),
                selectinload(TestExecution.test_case),
            )
            .filter(
                TestExecution.run_id == run_id,
                TestExecution.test_case_id == test_case_id,
            )
            .first()
        )

    def create(
        self,
        execution: TestExecution,
        commit: bool = True,
    ):
        self.db.add(execution)
        self.db.flush()

        if commit:
            self.db.commit()
            self.db.refresh(execution)

        return self.get_by_id(execution.id)

    def update(
        self,
        execution: TestExecution,
    ):
        self.db.commit()
        self.db.refresh(execution)

        return self.get_by_id(execution.id)

    def delete(
        self,
        execution: TestExecution,
    ):
        self.db.delete(execution)
        self.db.commit()