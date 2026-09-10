from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_admin
from app.db.session import get_db
from app.models.admin import Admin
from app.models.requirement import Requirement
from app.models.test_scenario import TestScenario
from app.models.test_case import TestCase
from app.testing_studio.constants import TestingType
from app.testing_studio.schemas import (
    StudioTestCaseCreate,
    StudioTestCaseUpdate,
)
from app.testing_studio.service import TestingStudioService
from app.testing_studio.exporter import TestingStudioExporter

router = APIRouter(prefix="/testing-studio", tags=["Testing Studio"])


def service(db: Session) -> TestingStudioService:
    return TestingStudioService(db)


@router.get("/types")
def get_types(_: Admin = Depends(get_current_admin)):
    return [
        {"value": item.value, "label": item.name.replace("_", " ").title()}
        for item in TestingType
    ]


@router.get("/projects/{project_id}/scenarios")
def get_scenarios(project_id: int, db: Session = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    svc = service(db)
    svc._project_access(project_id, admin)
    scenarios = (
        db.query(TestScenario)
        .join(Requirement, TestScenario.requirement_id == Requirement.id)
        .filter(Requirement.project_id == project_id)
        .order_by(TestScenario.scenario_code)
        .all()
    )
    return [
        {
            "id": item.id,
            "scenario_code": item.scenario_code,
            "requirement_id": item.requirement_id,
            "module": item.module,
            "title": item.title,
        }
        for item in scenarios
    ]


@router.get("/projects/{project_id}/test-cases")
def get_test_cases(project_id: int, testing_type: str | None = None, db: Session = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    try:
        cases = service(db).list_test_cases(project_id, admin, testing_type)
        return [service(db).serialize(case) for case in cases]
    except ValueError as exc:
        raise HTTPException(status_code=403, detail=str(exc))


@router.post("/projects/{project_id}/test-cases")
def create_test_case(project_id: int, payload: StudioTestCaseCreate, db: Session = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    try:
        case = service(db).create(project_id, payload, admin)
        return service(db).serialize(case)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.put("/projects/{project_id}/test-cases/{test_case_id}")
def update_test_case(project_id: int, test_case_id: int, payload: StudioTestCaseUpdate, db: Session = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    try:
        case = service(db).update(project_id, test_case_id, payload, admin)
        return service(db).serialize(case)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.delete("/projects/{project_id}/test-cases/{test_case_id}")
def delete_test_case(project_id: int, test_case_id: int, db: Session = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    try:
        service(db).delete(project_id, test_case_id, admin)
        return {"message": "Testing Studio test case deleted successfully"}
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.get("/projects/{project_id}/export")
def export_test_cases(project_id: int, testing_type: str | None = None, db: Session = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    try:
        svc = service(db)
        project = svc._project_access(project_id, admin)
        cases = svc.list_test_cases(project_id, admin, testing_type)
        exporter = TestingStudioExporter()
        excel = exporter.generate(project, [svc.serialize(case) for case in cases], testing_type)
        suffix = testing_type.lower() if testing_type else "all-testing"
        filename = f"{project.project_code}_{suffix}_TestCases.xlsx"
        return StreamingResponse(
            excel,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except ValueError as exc:
        raise HTTPException(status_code=403, detail=str(exc))

@router.put("/executions/{execution_id}/result")
def update_execution_result(execution_id: int, payload: dict, db: Session = Depends(get_db), admin: Admin = Depends(get_current_admin)):
    """Store discipline-specific execution output without changing the existing execution contract."""
    from app.models.test_execution import TestExecution
    from app.testing_studio.models import TestExecutionResultProfile
    from app.services.test_execution_service import TestExecutionService

    execution = db.query(TestExecution).filter(TestExecution.id == execution_id).first()
    if not execution:
        raise HTTPException(status_code=404, detail="Test Execution not found")
    TestExecutionService(db)._validate_execution_access(execution, admin)
    profile = db.query(TestExecutionResultProfile).filter(TestExecutionResultProfile.execution_id == execution_id).first()
    if not profile:
        profile = TestExecutionResultProfile(execution_id=execution_id)
        db.add(profile)
    profile.result_attributes = payload
    db.commit()
    db.refresh(profile)
    return {"execution_id": execution_id, "result_attributes": profile.result_attributes, "updated_at": profile.updated_at}
