from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.automation.schemas.automation_project import (
    AutomationProjectCreate,
    AutomationProjectResponse,
    AutomationProjectUpdate,
)
from app.automation.services.automation_project_service import (
    AutomationProjectService,
)
from app.db.session import get_db


router = APIRouter(
    prefix="/automation-projects",
    tags=["Automation Projects"],
)


@router.post(
    "/",
    response_model=AutomationProjectResponse,
)
def create_automation_project(
    data: AutomationProjectCreate,
    db: Session = Depends(get_db),
):
    service = AutomationProjectService(db)
    return service.create(data)


@router.get(
    "/project/{project_id}",
    response_model=AutomationProjectResponse,
)
def get_automation_project_by_project(
    project_id: int,
    db: Session = Depends(get_db),
):
    service = AutomationProjectService(db)
    return service.get_by_project_id(project_id)


@router.post(
    "/{automation_project_id}/run",
)
def start_automation_run(
    automation_project_id: int,
    db: Session = Depends(get_db),
):
    service = AutomationProjectService(db)
    return service.start_automation_run(
        automation_project_id
    )


@router.get(
    "/{automation_project_id}",
    response_model=AutomationProjectResponse,
)
def get_automation_project(
    automation_project_id: int,
    db: Session = Depends(get_db),
):
    service = AutomationProjectService(db)
    return service.get_by_id(automation_project_id)


@router.put(
    "/{automation_project_id}",
    response_model=AutomationProjectResponse,
)
def update_automation_project(
    automation_project_id: int,
    data: AutomationProjectUpdate,
    db: Session = Depends(get_db),
):
    service = AutomationProjectService(db)
    return service.update(
        automation_project_id,
        data,
    )


@router.delete(
    "/{automation_project_id}",
    status_code=204,
)
def delete_automation_project(
    automation_project_id: int,
    db: Session = Depends(get_db),
):
    service = AutomationProjectService(db)
    service.delete(automation_project_id)