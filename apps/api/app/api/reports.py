from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_admin
from app.db.session import get_db
from app.models.admin import Admin
from app.schemas.report import (
    ReportOverview,
    ExecutionAnalytics,
    CoverageAnalytics,
    DefectAnalytics,
    RiskAnalytics,
    TraceabilityAnalytics,
)
from app.services.report_service import ReportService


router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
)


@router.get(
    "/overview",
    response_model=ReportOverview,
)
def get_overview(
    project_id: int | None = None,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    service = ReportService(db)

    try:
        return service.get_overview(
            admin=admin,
            project_id=project_id,
        )
    except ValueError as ex:
        raise HTTPException(
            status_code=403,
            detail=str(ex),
        )


@router.get(
    "/execution",
    response_model=ExecutionAnalytics,
)
def get_execution_analytics(
    project_id: int | None = None,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    service = ReportService(db)

    try:
        return service.get_execution_analytics(
            admin=admin,
            project_id=project_id,
        )
    except ValueError as ex:
        raise HTTPException(
            status_code=403,
            detail=str(ex),
        )


@router.get(
    "/coverage",
    response_model=CoverageAnalytics,
)
def get_coverage_analytics(
    project_id: int | None = None,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    service = ReportService(db)

    try:
        return service.get_coverage_analytics(
            admin=admin,
            project_id=project_id,
        )
    except ValueError as ex:
        raise HTTPException(
            status_code=403,
            detail=str(ex),
        )


@router.get(
    "/defects",
    response_model=DefectAnalytics,
)
def get_defect_analytics(
    project_id: int | None = None,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    service = ReportService(db)

    try:
        return service.get_defect_analytics(
            admin=admin,
            project_id=project_id,
        )
    except ValueError as ex:
        raise HTTPException(
            status_code=403,
            detail=str(ex),
        )


@router.get(
    "/risk",
    response_model=RiskAnalytics,
)
def get_quality_risk(
    project_id: int | None = None,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    service = ReportService(db)

    try:
        return service.get_quality_risk(
            admin=admin,
            project_id=project_id,
        )
    except ValueError as ex:
        raise HTTPException(
            status_code=403,
            detail=str(ex),
        )


@router.get(
    "/traceability",
    response_model=TraceabilityAnalytics,
)
def get_traceability_analytics(
    project_id: int | None = None,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    service = ReportService(db)

    try:
        return service.get_traceability_analytics(
            admin=admin,
            project_id=project_id,
        )
    except ValueError as ex:
        raise HTTPException(
            status_code=403,
            detail=str(ex),
        )