from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.repositories.test_scenario_repository import (
    TestScenarioRepository,
)
from app.schemas.test_scenario import (
    TestScenarioCreate,
    TestScenarioResponse,
    TestScenarioUpdate,
)
from app.services.test_scenario_service import (
    TestScenarioService,
)

router = APIRouter(
    prefix="/test-scenarios",
    tags=["Test Scenarios"],
)


@router.post("/", response_model=TestScenarioResponse)
def create_test_scenario(
    test_scenario: TestScenarioCreate,
    db: Session = Depends(get_db),
):
    repository = TestScenarioRepository(db)
    service = TestScenarioService(repository)

    return service.create(test_scenario)


@router.get("/", response_model=list[TestScenarioResponse])
def get_test_scenarios(
    db: Session = Depends(get_db),
):
    repository = TestScenarioRepository(db)
    service = TestScenarioService(repository)

    return service.get_all()


@router.get("/{test_scenario_id}", response_model=TestScenarioResponse)
def get_test_scenario(
    test_scenario_id: int,
    db: Session = Depends(get_db),
):
    repository = TestScenarioRepository(db)
    service = TestScenarioService(repository)

    test_scenario = service.get_by_id(
        test_scenario_id
    )

    if not test_scenario:
        raise HTTPException(
            status_code=404,
            detail="Test Scenario not found",
        )

    return test_scenario


@router.put("/{test_scenario_id}", response_model=TestScenarioResponse)
def update_test_scenario(
    test_scenario_id: int,
    test_scenario_data: TestScenarioUpdate,
    db: Session = Depends(get_db),
):
    repository = TestScenarioRepository(db)
    service = TestScenarioService(repository)

    test_scenario = service.get_by_id(
        test_scenario_id
    )

    if not test_scenario:
        raise HTTPException(
            status_code=404,
            detail="Test Scenario not found",
        )

    return service.update(
        test_scenario,
        test_scenario_data,
    )


@router.delete("/{test_scenario_id}")
def delete_test_scenario(
    test_scenario_id: int,
    db: Session = Depends(get_db),
):
    repository = TestScenarioRepository(db)
    service = TestScenarioService(repository)

    test_scenario = service.get_by_id(
        test_scenario_id
    )

    if not test_scenario:
        raise HTTPException(
            status_code=404,
            detail="Test Scenario not found",
        )

    service.delete(test_scenario)

    return {
        "message": "Test Scenario deleted successfully",
    }