from sqlalchemy.orm import Session, selectinload

from app.models.bug import Bug
from app.models.test_execution import TestExecution


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
                selectinload(Bug.execution).selectinload(
                TestExecution.test_case,)
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
                selectinload(Bug.execution).selectinload(
                TestExecution.test_case,)
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