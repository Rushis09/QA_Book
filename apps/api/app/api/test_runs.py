from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.test_run import (
    TestRunCreate,
    TestRunResponse,
    TestRunUpdate,
)
from app.services.test_run_service import TestRunService

router = APIRouter(
    prefix="/test-runs",
    tags=["Test Runs"],
)


@router.post(
    "/",
    response_model=TestRunResponse,
)
def create_test_run(
    test_run: TestRunCreate,
    db: Session = Depends(get_db),
):
    service = TestRunService(db)

    return service.create_test_run(test_run)


@router.get(
    "/",
    response_model=list[TestRunResponse],
)
def get_test_runs(
    db: Session = Depends(get_db),
):
    service = TestRunService(db)

    return service.get_test_runs()


@router.get(
    "/{test_run_id}",
    response_model=TestRunResponse,
)
def get_test_run(
    test_run_id: int,
    db: Session = Depends(get_db),
):
    service = TestRunService(db)

    return service.get_test_run(test_run_id)


@router.put(
    "/{test_run_id}",
    response_model=TestRunResponse,
)
def update_test_run(
    test_run_id: int,
    test_run: TestRunUpdate,
    db: Session = Depends(get_db),
):
    service = TestRunService(db)

    return service.update_test_run(
        test_run_id,
        test_run,
    )


# NEW ENDPOINT
@router.post(
    "/{test_run_id}/finish",
    response_model=TestRunResponse,
)
def finish_test_run(
    test_run_id: int,
    db: Session = Depends(get_db),
):
    service = TestRunService(db)

    return service.finish_test_run(
        test_run_id,
    )


@router.delete(
    "/{test_run_id}",
)
def delete_test_run(
    test_run_id: int,
    db: Session = Depends(get_db),
):
    service = TestRunService(db)

    service.delete_test_run(test_run_id)

    return {
        "message": "Test Run deleted successfully",
    }