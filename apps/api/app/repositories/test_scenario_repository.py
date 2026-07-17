from sqlalchemy.orm import Session, selectinload

from app.models.test_scenario import TestScenario


class TestScenarioRepository:
    def __init__(self, db: Session):
        self.db = db

    @property
    def session(self) -> Session:
        return self.db

    def create(
        self,
        test_scenario: TestScenario,
    ) -> TestScenario:
        self.db.add(test_scenario)
        self.db.commit()
        self.db.refresh(test_scenario)
        return test_scenario

    def get_all(self):
        return (
            self.db.query(TestScenario)
            .options(selectinload(TestScenario.requirement))
            .all()
        )

    def get_by_id(
        self,
        test_scenario_id: int,
    ):
        return (
            self.db.query(TestScenario)
            .options(selectinload(TestScenario.requirement))
            .filter(TestScenario.id == test_scenario_id)
            .first()
        )

    def delete(
        self,
        test_scenario: TestScenario,
    ):
        self.db.delete(test_scenario)
        self.db.commit()