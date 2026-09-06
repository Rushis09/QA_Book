from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_admin
from app.db.session import get_db
from app.models.admin import Admin
from app.schemas.report import (
    ReportSummary,
    RequirementCoverageResponse,
    TraceabilityResponse,
)
from app.services.report_service import ReportService


router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
)


@router.get(
    "/summary",
    response_model=ReportSummary,
)
def get_summary(
    project_id: int | None = None,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    service = ReportService(db)

    try:
        return service.get_summary(
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
    response_model=RequirementCoverageResponse,
)
def get_requirement_coverage(
    project_id: int | None = None,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    service = ReportService(db)

    try:
        return {
            "coverage": service.get_requirement_coverage(
                admin=admin,
                project_id=project_id,
            ),
        }
    except ValueError as ex:
        raise HTTPException(
            status_code=403,
            detail=str(ex),
        )


@router.get(
    "/traceability",
    response_model=TraceabilityResponse,
)
def get_traceability(
    project_id: int | None = None,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    service = ReportService(db)

    try:
        return {
            "traceability": service.get_traceability(
                admin=admin,
                project_id=project_id,
            ),
        }
    except ValueError as ex:
        raise HTTPException(
            status_code=403,
            detail=str(ex),
        )