from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload

from app.db.session import get_db
from app.models.test_case import TestCase
from app.models.test_suite import TestSuite
from app.schemas.suite_assignment import (
    SuiteAssignmentRequest,
)
from app.schemas.test_suite import (
    TestSuiteCreate,
    TestSuiteResponse,
    TestSuiteUpdate,
)

router = APIRouter(
    prefix="/test-suites",
    tags=["Test Suites"],
)


@router.post("/", response_model=TestSuiteResponse)
def create_test_suite(
    test_suite: TestSuiteCreate,
    db: Session = Depends(get_db),
):
    last_test_suite = (
        db.query(TestSuite)
        .order_by(TestSuite.id.desc())
        .first()
    )

    next_number = 1

    if last_test_suite:
        next_number = last_test_suite.id + 1

    suite_code = f"TS-{next_number:03d}"

    db_test_suite = TestSuite(
        suite_code=suite_code,
        project_id=test_suite.project_id,
        name=test_suite.name,
        description=test_suite.description,
        status=test_suite.status,
    )

    db.add(db_test_suite)
    db.commit()
    db.refresh(db_test_suite)

    db_test_suite = (
        db.query(TestSuite)
        .options(
            selectinload(TestSuite.project),
            selectinload(TestSuite.test_cases),
        )
        .filter(TestSuite.id == db_test_suite.id)
        .first()
    )

    return db_test_suite


@router.get("/", response_model=list[TestSuiteResponse])
def get_test_suites(
    db: Session = Depends(get_db),
):
    return (
        db.query(TestSuite)
        .options(
            selectinload(TestSuite.project),
            selectinload(TestSuite.test_cases),
        )
        .all()
    )


@router.get("/{test_suite_id}", response_model=TestSuiteResponse)
def get_test_suite(
    test_suite_id: int,
    db: Session = Depends(get_db),
):
    test_suite = (
        db.query(TestSuite)
        .options(
            selectinload(TestSuite.project),
            selectinload(TestSuite.test_cases),
        )
        .filter(TestSuite.id == test_suite_id)
        .first()
    )

    if not test_suite:
        raise HTTPException(
            status_code=404,
            detail="Test Suite not found",
        )

    return test_suite


@router.put("/{test_suite_id}", response_model=TestSuiteResponse)
def update_test_suite(
    test_suite_id: int,
    test_suite_data: TestSuiteUpdate,
    db: Session = Depends(get_db),
):
    test_suite = (
        db.query(TestSuite)
        .filter(TestSuite.id == test_suite_id)
        .first()
    )

    if not test_suite:
        raise HTTPException(
            status_code=404,
            detail="Test Suite not found",
        )

    test_suite.project_id = test_suite_data.project_id
    test_suite.name = test_suite_data.name
    test_suite.description = test_suite_data.description
    test_suite.status = test_suite_data.status

    db.commit()
    db.refresh(test_suite)

    test_suite = (
        db.query(TestSuite)
        .options(
            selectinload(TestSuite.project),
            selectinload(TestSuite.test_cases),
        )
        .filter(TestSuite.id == test_suite.id)
        .first()
    )

    return test_suite


@router.put(
    "/{test_suite_id}/test-cases",
    response_model=TestSuiteResponse,
)
def assign_test_cases(
    test_suite_id: int,
    assignment: SuiteAssignmentRequest,
    db: Session = Depends(get_db),
):
    test_suite = (
        db.query(TestSuite)
        .options(selectinload(TestSuite.test_cases))
        .filter(TestSuite.id == test_suite_id)
        .first()
    )

    if not test_suite:
        raise HTTPException(
            status_code=404,
            detail="Test Suite not found",
        )

    test_cases = (
        db.query(TestCase)
        .filter(
            TestCase.id.in_(
                assignment.test_case_ids,
            )
        )
        .all()
    )

    test_suite.test_cases = test_cases

    db.commit()
    db.refresh(test_suite)

    test_suite = (
        db.query(TestSuite)
        .options(
            selectinload(TestSuite.project),
            selectinload(TestSuite.test_cases),
        )
        .filter(TestSuite.id == test_suite.id)
        .first()
    )

    return test_suite


@router.delete("/{test_suite_id}")
def delete_test_suite(
    test_suite_id: int,
    db: Session = Depends(get_db),
):
    test_suite = (
        db.query(TestSuite)
        .filter(TestSuite.id == test_suite_id)
        .first()
    )

    if not test_suite:
        raise HTTPException(
            status_code=404,
            detail="Test Suite not found",
        )

    db.delete(test_suite)
    db.commit()

    return {
        "message": "Test Suite deleted successfully",
    }