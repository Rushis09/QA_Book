from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.automation.schemas.automation_test_mapping import (
    AutomationTestMappingBulkCreate,
    AutomationTestMappingCreate,
    AutomationTestMappingResponse,
    AutomationTestMappingUpdate,
)
from app.automation.services.automation_test_mapping_service import (
    AutomationTestMappingService,
)
from app.db.session import get_db


router = APIRouter(
    prefix="/automation-test-mappings",
    tags=["Automation Test Mappings"],
)


@router.post(
    "/",
    response_model=AutomationTestMappingResponse,
)
def create_automation_test_mapping(
    data: AutomationTestMappingCreate,
    db: Session = Depends(get_db),
):
    service = AutomationTestMappingService(db)
    return service.create(data)


@router.post(
    "/bulk",
    response_model=list[AutomationTestMappingResponse],
)
def bulk_create_automation_test_mappings(
    data: AutomationTestMappingBulkCreate,
    db: Session = Depends(get_db),
):
    service = AutomationTestMappingService(db)
    return service.bulk_create(data)


@router.get(
    "/{mapping_id}",
    response_model=AutomationTestMappingResponse,
)
def get_automation_test_mapping(
    mapping_id: int,
    db: Session = Depends(get_db),
):
    service = AutomationTestMappingService(db)
    return service.get_by_id(mapping_id)


@router.get(
    "/project/{automation_project_id}",
    response_model=list[AutomationTestMappingResponse],
)
def get_automation_test_mappings(
    automation_project_id: int,
    db: Session = Depends(get_db),
):
    service = AutomationTestMappingService(db)
    return service.get_by_automation_project(
        automation_project_id
    )


@router.put(
    "/{mapping_id}",
    response_model=AutomationTestMappingResponse,
)
def update_automation_test_mapping(
    mapping_id: int,
    data: AutomationTestMappingUpdate,
    db: Session = Depends(get_db),
):
    service = AutomationTestMappingService(db)
    return service.update(mapping_id, data)


@router.delete(
    "/{mapping_id}",
    status_code=204,
)
def delete_automation_test_mapping(
    mapping_id: int,
    db: Session = Depends(get_db),
):
    service = AutomationTestMappingService(db)
    service.delete(mapping_id)