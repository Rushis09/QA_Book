from sqlalchemy.orm import Session, selectinload

from app.models.requirement import Requirement


class RequirementRepository:
    """Repository for Requirement database operations."""

    def __init__(self, db: Session):
        self.db = db

    def create(self, requirement: Requirement) -> Requirement:
        self.db.add(requirement)
        self.db.commit()
        self.db.refresh(requirement)

        return (
            self.db.query(Requirement)
            .options(selectinload(Requirement.project))
            .filter(Requirement.id == requirement.id)
            .first()
        )

    def get_all(self) -> list[Requirement]:
        return (
            self.db.query(Requirement)
            .options(selectinload(Requirement.project))
            .all()
        )
    
    def get_by_project(self, project_id: int) -> list[Requirement]:
        return (
            self.db.query(Requirement)
            .options(selectinload(Requirement.project))
            .filter(Requirement.project_id == project_id)
            .order_by(Requirement.requirement_code)
            .all()
        )

    def get_by_id(self, requirement_id: int) -> Requirement | None:
        return (
            self.db.query(Requirement)
            .options(selectinload(Requirement.project))
            .filter(Requirement.id == requirement_id)
            .first()
        )

    def get_last(self) -> Requirement | None:
        return (
            self.db.query(Requirement)
            .order_by(Requirement.id.desc())
            .first()
        )

    def update(self, requirement: Requirement) -> Requirement:
        self.db.commit()
        self.db.refresh(requirement)

        return (
            self.db.query(Requirement)
            .options(selectinload(Requirement.project))
            .filter(Requirement.id == requirement.id)
            .first()
        )

    def delete(self, requirement: Requirement):
        self.db.delete(requirement)
        self.db.commit()