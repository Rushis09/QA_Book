from sqlalchemy.orm import Session, selectinload

from app.models.test_case import TestCase
from app.models.test_suite import TestSuite


class TestSuiteRepository:
    def __init__(self, db: Session):
        self.db = db

    @property
    def session(self) -> Session:
        return self.db

    def create(self, test_suite: TestSuite):
        self.db.add(test_suite)
        self.db.commit()
        self.db.refresh(test_suite)

        return self.get_by_id(test_suite.id)

    def get_all(
        self,
        project_id: int,
    ):
        return (
            self.db.query(TestSuite)
            .options(
                selectinload(TestSuite.project),
                selectinload(TestSuite.test_cases),
            )
            .filter(
                TestSuite.project_id == project_id
            )
            .all()
        )

    def get_by_id(
        self,
        test_suite_id: int,
    ):
        return (
            self.db.query(TestSuite)
            .options(
                selectinload(TestSuite.project),
                selectinload(TestSuite.test_cases),
            )
            .filter(
                TestSuite.id == test_suite_id
            )
            .first()
        )

    def update(
        self,
        test_suite: TestSuite,
    ):
        self.db.commit()
        self.db.refresh(test_suite)

        return self.get_by_id(test_suite.id)

    def delete(
        self,
        test_suite: TestSuite,
    ):
        self.db.delete(test_suite)
        self.db.commit()

    def get_test_cases_by_ids(
        self,
        test_case_ids: list[int],
    ):
        return (
            self.db.query(TestCase)
            .filter(
                TestCase.id.in_(test_case_ids)
            )
            .all()
        )

    def assign_test_cases(
        self,
        test_suite: TestSuite,
        test_cases: list[TestCase],
    ):
        test_suite.test_cases = test_cases

        self.db.commit()
        self.db.refresh(test_suite)

        return self.get_by_id(test_suite.id)