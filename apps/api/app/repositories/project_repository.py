from sqlalchemy.orm import Session

from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate


class ProjectRepository:
    @staticmethod
    def create(db: Session, project: ProjectCreate) -> Project:
        db_project = Project(
            name=project.name,
            description=project.description,
        )

        db.add(db_project)
        db.commit()
        db.refresh(db_project)

        return db_project

    @staticmethod
    def get_all(db: Session) -> list[Project]:
        return db.query(Project).all()

    @staticmethod
    def get_by_id(db: Session, project_id: int) -> Project | None:
        return (
            db.query(Project)
            .filter(Project.id == project_id)
            .first()
        )

    @staticmethod
    def update(
        db: Session,
        project: Project,
        data: ProjectUpdate,
    ) -> Project:
        project.name = data.name
        project.description = data.description

        db.commit()
        db.refresh(project)

        return project

    @staticmethod
    def delete(
        db: Session,
        project: Project,
    ) -> None:
        db.delete(project)
        db.commit()