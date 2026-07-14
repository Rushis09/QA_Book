from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.test_execution import (
    TestExecutionCreate,
    TestExecutionResponse,
    TestExecutionUpdate,
)
from app.services.test_execution_service import (
    TestExecutionService,
)

router = APIRouter(
    prefix="/test-executions",
    tags=["Test Executions"],
)


@router.post(
    "/",
    response_model=TestExecutionResponse,
)
def create_test_execution(
    test_execution: TestExecutionCreate,
    db: Session = Depends(get_db),
):
    service = TestExecutionService(db)

    return service.create_test_execution(
        test_execution,
    )


@router.get(
    "/run/{run_id}",
    response_model=list[TestExecutionResponse],
)
def get_run_executions(
    run_id: int,
    db: Session = Depends(get_db),
):
    service = TestExecutionService(db)

    return service.get_or_create_executions(
        run_id,
    )

@router.get(
    "/run/{run_id}/summary",
)
def get_execution_summary(
    run_id: int,
    db: Session = Depends(get_db),
):
    service = TestExecutionService(db)

    return service.get_execution_summary(
        run_id,
    )

@router.get(
    "/",
    response_model=list[TestExecutionResponse],
)
def get_test_executions(
    db: Session = Depends(get_db),
):
    service = TestExecutionService(db)

    return service.get_test_executions()


@router.get(
    "/{execution_id}",
    response_model=TestExecutionResponse,
)
def get_test_execution(
    execution_id: int,
    db: Session = Depends(get_db),
):
    service = TestExecutionService(db)

    return service.get_test_execution(
        execution_id,
    )


@router.put(
    "/{execution_id}",
    response_model=TestExecutionResponse,
)
def update_test_execution(
    execution_id: int,
    test_execution: TestExecutionUpdate,
    db: Session = Depends(get_db),
):
    service = TestExecutionService(db)

    return service.update_test_execution(
        execution_id,
        test_execution,
    )


@router.delete(
    "/{execution_id}",
)
def delete_test_execution(
    execution_id: int,
    db: Session = Depends(get_db),
):
    service = TestExecutionService(db)

    service.delete_test_execution(
        execution_id,
    )

    return {
        "message": "Test Execution deleted successfully",
    }