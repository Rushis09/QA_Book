from sqlalchemy.orm import Session, selectinload

from app.models.bug import Bug
from app.models.project import Project
from app.models.test_execution import TestExecution
from app.models.test_run import TestRun
from app.models.test_suite import TestSuite


class BugRepository:
    def __init__(
        self,
        db: Session,
    ):
        self.db = db

    def get_all(
        self,
    ):
        return (
            self.db.query(Bug)
            .options(
                selectinload(Bug.execution)
                .selectinload(TestExecution.test_case),
            )
            .all()
        )

    def get_by_owner(
        self,
        admin_id: int,
    ):
        return (
            self.db.query(Bug)
            .join(
                TestExecution,
                Bug.execution_id == TestExecution.id,
            )
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
                selectinload(Bug.execution)
                .selectinload(TestExecution.test_case),
            )
            .filter(
                Project.admin_id == admin_id,
            )
            .all()
        )

    def get_by_id(
        self,
        bug_id: int,
    ):
        return (
            self.db.query(Bug)
            .options(
                selectinload(Bug.execution)
                .selectinload(TestExecution.test_case),
            )
            .filter(
                Bug.id == bug_id,
            )
            .first()
        )

    def create(
        self,
        bug: Bug,
    ):
        self.db.add(bug)
        self.db.commit()
        self.db.refresh(bug)

        return self.get_by_id(
            bug.id,
        )

    def update(
        self,
        bug: Bug,
    ):
        self.db.commit()
        self.db.refresh(bug)

        return self.get_by_id(
            bug.id,
        )

    def delete(
        self,
        bug: Bug,
    ):
        self.db.delete(bug)
        self.db.commit()

    def get_last_bug(
        self,
    ):
        return (
            self.db.query(Bug)
            .order_by(Bug.id.desc())
            .first()
        )