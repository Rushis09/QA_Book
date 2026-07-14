from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload

from app.db.session import get_db
from app.models.test_scenario import TestScenario
from app.schemas.test_scenario import (
    TestScenarioCreate,
    TestScenarioResponse,
    TestScenarioUpdate,
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
    last_test_scenario = (
        db.query(TestScenario)
        .order_by(TestScenario.id.desc())
        .first()
    )

    next_number = 1

    if last_test_scenario:
        next_number = last_test_scenario.id + 1

    scenario_code = f"SCN-{next_number:03d}"

    db_test_scenario = TestScenario(
        scenario_code=scenario_code,
        title=test_scenario.title,
        description=test_scenario.description,
        requirement_id=test_scenario.requirement_id,
    )

    db.add(db_test_scenario)
    db.commit()
    db.refresh(db_test_scenario)

    db_test_scenario = (
        db.query(TestScenario)
        .options(selectinload(TestScenario.requirement))
        .filter(TestScenario.id == db_test_scenario.id)
        .first()
    )

    return db_test_scenario


@router.get("/", response_model=list[TestScenarioResponse])
def get_test_scenarios(
    db: Session = Depends(get_db),
):
    return (
        db.query(TestScenario)
        .options(selectinload(TestScenario.requirement))
        .all()
    )


@router.get("/{test_scenario_id}", response_model=TestScenarioResponse)
def get_test_scenario(
    test_scenario_id: int,
    db: Session = Depends(get_db),
):
    test_scenario = (
        db.query(TestScenario)
        .options(selectinload(TestScenario.requirement))
        .filter(TestScenario.id == test_scenario_id)
        .first()
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
    test_scenario = (
        db.query(TestScenario)
        .filter(TestScenario.id == test_scenario_id)
        .first()
    )

    if not test_scenario:
        raise HTTPException(
            status_code=404,
            detail="Test Scenario not found",
        )

    test_scenario.title = test_scenario_data.title
    test_scenario.description = test_scenario_data.description
    test_scenario.requirement_id = test_scenario_data.requirement_id

    db.commit()
    db.refresh(test_scenario)

    test_scenario = (
        db.query(TestScenario)
        .options(selectinload(TestScenario.requirement))
        .filter(TestScenario.id == test_scenario.id)
        .first()
    )

    return test_scenario


@router.delete("/{test_scenario_id}")
def delete_test_scenario(
    test_scenario_id: int,
    db: Session = Depends(get_db),
):
    test_scenario = (
        db.query(TestScenario)
        .filter(TestScenario.id == test_scenario_id)
        .first()
    )

    if not test_scenario:
        raise HTTPException(
            status_code=404,
            detail="Test Scenario not found",
        )

    db.delete(test_scenario)
    db.commit()

    return {
        "message": "Test Scenario deleted successfully",
    }