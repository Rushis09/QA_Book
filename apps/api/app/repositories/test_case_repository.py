from sqlalchemy.orm import Session, selectinload

from app.models.requirement import Requirement
from app.models.test_case import TestCase
from app.models.test_scenario import TestScenario


class TestCaseRepository:
    def __init__(self, db: Session):
        self.db = db

    @property
    def session(self) -> Session:
        return self.db

    def create(
        self,
        test_case: TestCase,
    ) -> TestCase:
        self.db.add(test_case)
        self.db.commit()
        self.db.refresh(test_case)
        return test_case

    def get_all(
        self,
        project_id: int | None = None,
    ):
        query = (
            self.db.query(TestCase)
            .options(
                selectinload(TestCase.scenario).selectinload(
                    TestScenario.requirement
                )
            )
        )

        if project_id is not None:
            query = (
                query.join(TestScenario)
                .join(Requirement)
                .filter(
                    Requirement.project_id == project_id
                )
            )

        return query.all()

    def get_by_id(
        self,
        test_case_id: int,
    ):
        return (
            self.db.query(TestCase)
            .options(
                selectinload(TestCase.scenario).selectinload(
                    TestScenario.requirement
                )
            )
            .filter(TestCase.id == test_case_id)
            .first()
        )

    def delete(
        self,
        test_case: TestCase,
    ):
        self.db.delete(test_case)
        self.db.commit()