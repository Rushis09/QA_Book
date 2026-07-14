from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.repositories.project_repository import ProjectRepository
from app.schemas.project import ProjectCreate, ProjectUpdate


class ProjectService:
    @staticmethod
    def create_project(db: Session, project: ProjectCreate):
        return ProjectRepository.create(db, project)

    @staticmethod
    def get_projects(db: Session):
        return ProjectRepository.get_all(db)

    @staticmethod
    def get_project(db: Session, project_id: int):
        project = ProjectRepository.get_by_id(db, project_id)

        if not project:
            raise HTTPException(
                status_code=404,
                detail="Project not found",
            )

        return project

    @staticmethod
    def update_project(
        db: Session,
        project_id: int,
        project_data: ProjectUpdate,
    ):
        project = ProjectRepository.get_by_id(db, project_id)

        if not project:
            raise HTTPException(
                status_code=404,
                detail="Project not found",
            )

        return ProjectRepository.update(
            db,
            project,
            project_data,
        )

    @staticmethod
    def delete_project(
        db: Session,
        project_id: int,
    ):
        project = ProjectRepository.get_by_id(db, project_id)

        if not project:
            raise HTTPException(
                status_code=404,
                detail="Project not found",
            )

        ProjectRepository.delete(db, project)

        return {
            "message": "Project deleted successfully",
        }