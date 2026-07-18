from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.repositories.test_case_repository import (
    TestCaseRepository,
)
from app.schemas.test_case import (
    TestCaseCreate,
    TestCaseResponse,
    TestCaseUpdate,
)
from app.services.test_case_service import (
    TestCaseService,
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
    repository = TestCaseRepository(db)
    service = TestCaseService(repository)

    return service.create(test_case)


@router.get("/", response_model=list[TestCaseResponse])
def get_test_cases(
    project_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    repository = TestCaseRepository(db)
    service = TestCaseService(repository)

    return service.get_all(project_id)


@router.get("/{test_case_id}", response_model=TestCaseResponse)
def get_test_case(
    test_case_id: int,
    db: Session = Depends(get_db),
):
    repository = TestCaseRepository(db)
    service = TestCaseService(repository)

    test_case = service.get_by_id(
        test_case_id
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
    repository = TestCaseRepository(db)
    service = TestCaseService(repository)

    test_case = service.get_by_id(
        test_case_id
    )

    if not test_case:
        raise HTTPException(
            status_code=404,
            detail="Test Case not found",
        )

    return service.update(
        test_case,
        test_case_data,
    )


@router.delete("/{test_case_id}")
def delete_test_case(
    test_case_id: int,
    db: Session = Depends(get_db),
):
    repository = TestCaseRepository(db)
    service = TestCaseService(repository)

    test_case = service.get_by_id(
        test_case_id
    )

    if not test_case:
        raise HTTPException(
            status_code=404,
            detail="Test Case not found",
        )

    service.delete(test_case)

    return {
        "message": "Test Case deleted successfully",
    }