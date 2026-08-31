from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db

from app.repositories.test_suite_repository import TestSuiteRepository
from app.services.test_suite_service import TestSuiteService


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

def get_test_suite_service(
    db: Session = Depends(get_db),
) -> TestSuiteService:
    repository = TestSuiteRepository(db)
    return TestSuiteService(repository)


@router.post("/", response_model=TestSuiteResponse)
def create_test_suite(
    test_suite: TestSuiteCreate,
    service: TestSuiteService = Depends(get_test_suite_service),
):
    return service.create(test_suite)


@router.get("/", response_model=list[TestSuiteResponse])
def get_test_suites(
    project_id: int,
    service: TestSuiteService = Depends(get_test_suite_service),
):
    return service.get_all(project_id)


@router.get("/{test_suite_id}", response_model=TestSuiteResponse)
def get_test_suite(
    test_suite_id: int,
    service: TestSuiteService = Depends(get_test_suite_service),
):
    return service.get_by_id(test_suite_id)

@router.put("/{test_suite_id}", response_model=TestSuiteResponse)
def update_test_suite(
    test_suite_id: int,
    test_suite_data: TestSuiteUpdate,
    service: TestSuiteService = Depends(get_test_suite_service),
):
    return service.update(
        test_suite_id,
        test_suite_data,
    )


@router.put(
    "/{test_suite_id}/test-cases",
    response_model=TestSuiteResponse,
)
def assign_test_cases(
    test_suite_id: int,
    assignment: SuiteAssignmentRequest,
    service: TestSuiteService = Depends(get_test_suite_service),
):
    return service.assign_test_cases(
        test_suite_id,
        assignment,
    )


@router.delete("/{test_suite_id}")
def delete_test_suite(
    test_suite_id: int,
    service: TestSuiteService = Depends(get_test_suite_service),
):
    return service.delete(test_suite_id)