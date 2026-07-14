from sqlalchemy.orm import Session, selectinload

from app.models.test_run import TestRun


class TestRunRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return (
            self.db.query(TestRun)
            .options(
                selectinload(TestRun.suite))
            .all()
        )
    def get_last(self):
        return (
            self.db.query(TestRun)
            .order_by(TestRun.id.desc())
            .first()
        )

    def get_by_id(
        self,
        test_run_id: int,
    ):
        return (
            self.db.query(TestRun)
            .options(
                selectinload(TestRun.suite)
            )
            .filter(
                TestRun.id == test_run_id,
            )
            .first()
        )

    def create(
        self,
        test_run: TestRun,
    ):
        self.db.add(test_run)
        self.db.commit()
        self.db.refresh(test_run)

        return self.get_by_id(test_run.id)

    def update(
        self,
        test_run: TestRun,
    ):
        self.db.commit()
        self.db.refresh(test_run)

        return self.get_by_id(test_run.id)

    def delete(
        self,
        test_run: TestRun,
    ):
        self.db.delete(test_run)
        self.db.commit()