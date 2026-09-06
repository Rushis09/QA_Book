from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_admin
from app.db.session import get_db
from app.models.admin import Admin
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


def get_test_scenario_service(
    db: Session,
) -> TestScenarioService:
    repository = TestScenarioRepository(db)

    return TestScenarioService(
        repository
    )


@router.post(
    "/",
    response_model=TestScenarioResponse,
)
def create_test_scenario(
    test_scenario: TestScenarioCreate,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    service = get_test_scenario_service(db)

    try:
        return service.create(
            test_scenario_data=test_scenario,
            admin=admin,
        )

    except ValueError as ex:
        raise HTTPException(
            status_code=403,
            detail=str(ex),
        )


@router.get(
    "/",
    response_model=list[TestScenarioResponse],
)
def get_test_scenarios(
    project_id: int | None = Query(
        default=None
    ),
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    service = get_test_scenario_service(db)

    try:
        return service.get_all(
            project_id=project_id,
            admin=admin,
        )

    except ValueError as ex:
        raise HTTPException(
            status_code=403,
            detail=str(ex),
        )


@router.get(
    "/{test_scenario_id}",
    response_model=TestScenarioResponse,
)
def get_test_scenario(
    test_scenario_id: int,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    service = get_test_scenario_service(db)

    try:
        test_scenario = service.get_by_id(
            test_scenario_id=test_scenario_id,
            admin=admin,
        )

        if not test_scenario:
            raise HTTPException(
                status_code=404,
                detail="Test Scenario not found",
            )

        return test_scenario

    except ValueError as ex:
        raise HTTPException(
            status_code=403,
            detail=str(ex),
        )


@router.put(
    "/{test_scenario_id}",
    response_model=TestScenarioResponse,
)
def update_test_scenario(
    test_scenario_id: int,
    test_scenario_data: TestScenarioUpdate,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    service = get_test_scenario_service(db)

    try:
        test_scenario = service.get_by_id(
            test_scenario_id=test_scenario_id,
            admin=admin,
        )

        if not test_scenario:
            raise HTTPException(
                status_code=404,
                detail="Test Scenario not found",
            )

        return service.update(
            test_scenario=test_scenario,
            test_scenario_data=test_scenario_data,
            admin=admin,
        )

    except ValueError as ex:
        raise HTTPException(
            status_code=403,
            detail=str(ex),
        )


@router.delete(
    "/{test_scenario_id}"
)
def delete_test_scenario(
    test_scenario_id: int,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    service = get_test_scenario_service(db)

    try:
        test_scenario = service.get_by_id(
            test_scenario_id=test_scenario_id,
            admin=admin,
        )

        if not test_scenario:
            raise HTTPException(
                status_code=404,
                detail="Test Scenario not found",
            )

        service.delete(
            test_scenario=test_scenario,
            admin=admin,
        )

        return {
            "message": "Test Scenario deleted successfully",
        }

    except ValueError as ex:
        raise HTTPException(
            status_code=403,
            detail=str(ex),
        )