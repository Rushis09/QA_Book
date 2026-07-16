from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload

from app.db.session import get_db
from app.models.test_case import TestCase
from app.schemas.test_case import (
    TestCaseCreate,
    TestCaseResponse,
    TestCaseUpdate,
)

router = APIRouter(
    prefix="/test-cases",
    tags=["Test Cases"],
)


@router.post("/", response_model=TestCaseResponse)
def create_test_case(
    test_case: TestCaseCreate,
    db: Session = Depends(get_db),
):
    last_test_case = (
        db.query(TestCase)
        .order_by(TestCase.id.desc())
        .first()
    )

    next_number = 1

    if last_test_case:
        next_number = last_test_case.id + 1

    test_case_code = f"TC-{next_number:03d}"

    db_test_case = TestCase(
        test_case_code=test_case_code,
        scenario_id=test_case.scenario_id,
        module=test_case.module,
        priority=test_case.priority,
        status=test_case.status,
        title=test_case.title,
        description=test_case.description,
        preconditions=test_case.preconditions,
        test_data=test_case.test_data,
        steps=test_case.steps,
        expected_result=test_case.expected_result,
    )

    db.add(db_test_case)
    db.commit()
    db.refresh(db_test_case)

    db_test_case = (
        db.query(TestCase)
        .options(selectinload(TestCase.scenario))
        .filter(TestCase.id == db_test_case.id)
        .first()
    )

    return db_test_case


@router.get("/", response_model=list[TestCaseResponse])
def get_test_cases(
    db: Session = Depends(get_db),
):
    return (
        db.query(TestCase)
        .options(selectinload(TestCase.scenario))
        .all()
    )


@router.get("/{test_case_id}", response_model=TestCaseResponse)
def get_test_case(
    test_case_id: int,
    db: Session = Depends(get_db),
):
    test_case = (
        db.query(TestCase)
        .options(selectinload(TestCase.scenario))
        .filter(TestCase.id == test_case_id)
        .first()
    )

    if not test_case:
        raise HTTPException(
            status_code=404,
            detail="Test Case not found",
        )

    return test_case


@router.put("/{test_case_id}", response_model=TestCaseResponse)
def update_test_case(
    test_case_id: int,
    test_case_data: TestCaseUpdate,
    db: Session = Depends(get_db),
):
    test_case = (
        db.query(TestCase)
        .filter(TestCase.id == test_case_id)
        .first()
    )

    if not test_case:
        raise HTTPException(
            status_code=404,
            detail="Test Case not found",
        )

    test_case.scenario_id = test_case_data.scenario_id
    test_case.module = test_case_data.module
    test_case.priority = test_case_data.priority
    test_case.status = test_case_data.status
    test_case.title = test_case_data.title
    test_case.description = test_case_data.description
    test_case.preconditions = test_case_data.preconditions
    test_case.test_data = test_case_data.test_data
    test_case.steps = test_case_data.steps
    test_case.expected_result = (
        test_case_data.expected_result
    )

    db.commit()
    db.refresh(test_case)

    test_case = (
        db.query(TestCase)
        .options(selectinload(TestCase.scenario))
        .filter(TestCase.id == test_case.id)
        .first()
    )

    return test_case


@router.delete("/{test_case_id}")
def delete_test_case(
    test_case_id: int,
    db: Session = Depends(get_db),
):
    test_case = (
        db.query(TestCase)
        .filter(TestCase.id == test_case_id)
        .first()
    )

    if not test_case:
        raise HTTPException(
            status_code=404,
            detail="Test Case not found",
        )

    db.delete(test_case)
    db.commit()

    return {
        "message": "Test Case deleted successfully",
    }