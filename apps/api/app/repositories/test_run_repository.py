from sqlalchemy.orm import Session, selectinload

from app.models.project import Project
from app.models.test_run import TestRun
from app.models.test_suite import TestSuite


class TestRunRepository:
    def __init__(self, db: Session):
        self.db = db

    @property
    def session(self) -> Session:
        return self.db

    def get_all(
        self,
        project_id: int | None = None,
    ):
        query = (
            self.db.query(TestRun)
            .join(
                TestSuite,
                TestRun.suite_id == TestSuite.id,
            )
            .options(
                selectinload(TestRun.suite)
            )
        )

        if project_id is not None:
            query = query.filter(
                TestSuite.project_id == project_id
            )

        return query.order_by(
            TestRun.run_code
        ).all()

    def get_by_owner(
        self,
        admin_id: int,
    ):
        return (
            self.db.query(TestRun)
            .join(
                TestSuite,
                TestRun.suite_id == TestSuite.id,
            )
            .join(
                Project,
                TestSuite.project_id == Project.id,
            )
            .options(
                selectinload(TestRun.suite)
            )
            .filter(
                Project.admin_id == admin_id
            )
            .order_by(
                TestRun.run_code
            )
            .all()
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

    def get_by_run_code(
        self,
        run_code: str,
    ):
        return (
            self.db.query(TestRun)
            .options(
                selectinload(TestRun.suite)
            )
            .filter(
                TestRun.run_code == run_code,
            )
            .first()
        )

    def create(
        self,
        test_run: TestRun,
        commit: bool = True,
    ):
        self.db.add(test_run)
        self.db.flush()

        if commit:
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