from sqlalchemy.orm import Session, selectinload

from app.automation.models.automation_project import AutomationProject


class AutomationProjectRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        automation_project: AutomationProject,
    ):
        self.db.add(automation_project)
        self.db.commit()
        self.db.refresh(automation_project)

        return self.get_by_id(
            automation_project.id
        )

    def get_by_project_id(
        self,
        project_id: int,
    ):
        return (
            self.db.query(AutomationProject)
            .options(
                selectinload(
                    AutomationProject.project
                ),
                selectinload(
                    AutomationProject.mappings
                ),
            )
            .filter(
                AutomationProject.project_id
                == project_id
            )
            .first()
        )

    def get_by_id(
        self,
        automation_project_id: int,
    ):
        return (
            self.db.query(AutomationProject)
            .options(
                selectinload(
                    AutomationProject.project
                ),
                selectinload(
                    AutomationProject.mappings
                ),
            )
            .filter(
                AutomationProject.id
                == automation_project_id
            )
            .first()
        )

    def update(
        self,
        automation_project: AutomationProject,
    ):
        self.db.commit()
        self.db.refresh(automation_project)

        return self.get_by_id(
            automation_project.id
        )

    def delete(
        self,
        automation_project: AutomationProject,
    ):
        self.db.delete(automation_project)
        self.db.commit()