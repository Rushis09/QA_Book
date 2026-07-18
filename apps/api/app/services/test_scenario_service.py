from app.models.test_scenario import TestScenario
from app.repositories.test_scenario_repository import (
    TestScenarioRepository,
)
from app.schemas.test_scenario import (
    TestScenarioCreate,
    TestScenarioUpdate,
)


class TestScenarioService:
    def __init__(
        self,
        repository: TestScenarioRepository,
    ):
        self.repository = repository

    def create(
        self,
        test_scenario_data: TestScenarioCreate,
    ):
        scenario_count = (
            self.repository.session.query(TestScenario)
            .filter(
                TestScenario.requirement_id
                == test_scenario_data.requirement_id
            )
            .count()
        )
    
        next_number = scenario_count + 1
    
        scenario_code = f"SCN{next_number:03d}"
    
        test_scenario = TestScenario(
            scenario_code=scenario_code,
            requirement_id=test_scenario_data.requirement_id,
            module=test_scenario_data.module,
            title=test_scenario_data.title,
            description=test_scenario_data.description,
            priority=test_scenario_data.priority,
            status=test_scenario_data.status,
        )
    
        created = self.repository.create(test_scenario)
    
        return self.repository.get_by_id(created.id)

    def get_all(
        self,
        project_id: int | None = None,
    ):
        return self.repository.get_all(
            project_id,
        )

    def get_by_id(
        self,
        test_scenario_id: int,
    ):
        return self.repository.get_by_id(
            test_scenario_id
        )

    def update(
        self,
        test_scenario: TestScenario,
        test_scenario_data: TestScenarioUpdate,
    ):
        test_scenario.requirement_id = (
            test_scenario_data.requirement_id
        )
        test_scenario.module = (
            test_scenario_data.module
        )
        test_scenario.title = (
            test_scenario_data.title
        )
        test_scenario.description = (
            test_scenario_data.description
        )
        test_scenario.priority = (
            test_scenario_data.priority
        )
        test_scenario.status = (
            test_scenario_data.status
        )

        self.repository.session.commit()

        return self.repository.get_by_id(
            test_scenario.id
        )

    def delete(
        self,
        test_scenario: TestScenario,
    ):
        self.repository.delete(test_scenario)