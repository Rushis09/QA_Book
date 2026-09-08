from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_admin
from app.db.session import get_db
from app.models.admin import Admin
from app.models.project import Project
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
)
from app.utils.code_generator import generate_sequential_code
from app.services.project_service import ProjectService

router = APIRouter(
    prefix="/projects",
    tags=["Projects"],
)


@router.post(
    "/",
    response_model=ProjectResponse,
)
def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    db_project = Project(
        project_code=generate_sequential_code(
            db=db,
            entity_type="project",
            prefix="PRJ",
        ),
        admin_id=admin.id,
        name=project.name,
        description=project.description,
        status=project.status,
        version=project.version,
        start_date=project.start_date,
        end_date=project.end_date,
    )

    db.add(db_project)
    db.commit()
    db.refresh(db_project)

    return db_project


@router.get(
    "/",
    response_model=list[ProjectResponse],
)
def get_projects(
    owner_id: int | None = Query(
        default=None,
        description="Filter projects by owner. Platform Admin only.",
    ),
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    query = db.query(Project)

    if admin.role == "PLATFORM_ADMIN":
        if owner_id is not None:
            query = query.filter(
                Project.admin_id == owner_id
            )

        return query.order_by(Project.id).all()

    return (
        query
        .filter(Project.admin_id == admin.id)
        .order_by(Project.id)
        .all()
    )


@router.get(
    "/{project_id}",
    response_model=ProjectResponse,
)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    query = db.query(Project).filter(
        Project.id == project_id
    )

    if admin.role != "PLATFORM_ADMIN":
        query = query.filter(
            Project.admin_id == admin.id
        )

    project = query.first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    return project


@router.put(
    "/{project_id}",
    response_model=ProjectResponse,
)
def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    query = db.query(Project).filter(
        Project.id == project_id
    )

    if admin.role != "PLATFORM_ADMIN":
        query = query.filter(
            Project.admin_id == admin.id
        )

    project = query.first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    project.name = project_data.name
    project.description = project_data.description
    project.status = project_data.status
    project.version = project_data.version
    project.start_date = project_data.start_date
    project.end_date = project_data.end_date

    db.commit()
    db.refresh(project)

    return project


@router.get(
    "/{project_id}/delete-impact",
)
def get_delete_impact(
    project_id: int,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    query = db.query(Project).filter(
        Project.id == project_id
    )

    if admin.role != "PLATFORM_ADMIN":
        query = query.filter(
            Project.admin_id == admin.id
        )

    project = query.first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    return ProjectService.get_delete_impact(
        db=db,
        project_id=project_id,
    )

@router.delete(
    "/{project_id}",
)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    admin: Admin = Depends(get_current_admin),
):
    query = db.query(Project).filter(
        Project.id == project_id
    )

    if admin.role != "PLATFORM_ADMIN":
        query = query.filter(
            Project.admin_id == admin.id
        )

    project = query.first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    return ProjectService.delete_project(
        db=db,
        project_id=project_id,
    )