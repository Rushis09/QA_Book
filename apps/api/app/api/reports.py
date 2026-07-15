from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db

from app.schemas.report import (
    ReportSummary,
    RequirementCoverageResponse,
)

from app.services.report_service import (
    ReportService,
)
from app.schemas.report import (
    ReportSummary,
    RequirementCoverageResponse,
    TraceabilityResponse,
)

router = APIRouter(
    prefix="/reports",
    tags=["Reports"],
)


@router.get(
    "/summary",
    response_model=ReportSummary,
)
def get_summary(
    db: Session = Depends(
        get_db,
    ),
):
    service = ReportService(
        db,
    )

    return service.get_summary()

@router.get(
    "/coverage",
    response_model=RequirementCoverageResponse,
)
def get_requirement_coverage(
    db: Session = Depends(
        get_db,
    ),
):
    service = ReportService(
        db,
    )

    return {
        "coverage": service.get_requirement_coverage(),
    }

@router.get(
    "/traceability",
    response_model=TraceabilityResponse,
)
def get_traceability(
    db: Session = Depends(
        get_db,
    ),
):
    service = ReportService(
        db,
    )

    return {
        "traceability": (
            service.get_traceability()
        ),
    }