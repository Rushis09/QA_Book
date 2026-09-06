from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_admin
from app.db.session import get_db
from app.models.admin import Admin
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
    service: TestSuiteService = Depends(
        get_test_suite_service
    ),
    admin: Admin = Depends(get_current_admin),
):
    try:
        return service.create(
            test_suite,
            admin,
        )
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc


@router.get("/", response_model=list[TestSuiteResponse])
def get_test_suites(
    project_id: int | None = None,
    service: TestSuiteService = Depends(
        get_test_suite_service
    ),
    admin: Admin = Depends(get_current_admin),
):
    return service.get_all(
        project_id,
        admin,
    )


@router.get(
    "/{test_suite_id}",
    response_model=TestSuiteResponse,
)
def get_test_suite(
    test_suite_id: int,
    service: TestSuiteService = Depends(
        get_test_suite_service
    ),
    admin: Admin = Depends(get_current_admin),
):
    return service.get_by_id(
        test_suite_id,
        admin,
    )


@router.put(
    "/{test_suite_id}",
    response_model=TestSuiteResponse,
)
def update_test_suite(
    test_suite_id: int,
    test_suite_data: TestSuiteUpdate,
    service: TestSuiteService = Depends(
        get_test_suite_service
    ),
    admin: Admin = Depends(get_current_admin),
):
    return service.update(
        test_suite_id,
        test_suite_data,
        admin,
    )


@router.put(
    "/{test_suite_id}/test-cases",
    response_model=TestSuiteResponse,
)
def assign_test_cases(
    test_suite_id: int,
    assignment: SuiteAssignmentRequest,
    service: TestSuiteService = Depends(
        get_test_suite_service
    ),
    admin: Admin = Depends(get_current_admin),
):
    return service.assign_test_cases(
        test_suite_id,
        assignment,
        admin,
    )


@router.delete("/{test_suite_id}")
def delete_test_suite(
    test_suite_id: int,
    service: TestSuiteService = Depends(
        get_test_suite_service
    ),
    admin: Admin = Depends(get_current_admin),
):
    return service.delete(
        test_suite_id,
        admin,
    )