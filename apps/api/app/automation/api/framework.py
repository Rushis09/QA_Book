from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.automation.repositories.automation_project_repository import (
    AutomationProjectRepository,
)
from app.automation.services.framework_generator_service import (
    FrameworkGeneratorService,
)
from app.db.session import get_db


router = APIRouter(
    prefix="/automation-frameworks",
    tags=["Automation Frameworks"],
)


@router.get(
    "/{automation_project_id}/download",
)
def download_framework(
    automation_project_id: int,
    db: Session = Depends(get_db),
):
    repository = AutomationProjectRepository(db)

    automation_project = repository.get_by_id(
        automation_project_id
    )

    if not automation_project:
        raise HTTPException(
            status_code=404,
            detail="Automation project not found",
        )

    generator = FrameworkGeneratorService()

    buffer = generator.generate(
        automation_project
    )

    filename = (
        f"{automation_project.name}"
        .strip()
        .replace(" ", "_")
        + ".zip"
    )

    return StreamingResponse(
        buffer,
        media_type="application/zip",
        headers={
            "Content-Disposition": (
                f'attachment; filename="{filename}"'
            )
        },
    )