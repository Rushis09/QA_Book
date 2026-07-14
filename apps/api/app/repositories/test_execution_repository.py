from sqlalchemy.orm import Session, selectinload

from app.models.test_execution import TestExecution


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

    def create(
        self,
        execution: TestExecution,
    ):
        self.db.add(execution)
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