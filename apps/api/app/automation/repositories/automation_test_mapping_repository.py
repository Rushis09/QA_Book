from sqlalchemy.orm import Session, selectinload

from app.automation.models.automation_test_mapping import (
    AutomationTestMapping,
)


class AutomationTestMappingRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        mapping: AutomationTestMapping,
    ):
        self.db.add(mapping)
        self.db.commit()
        self.db.refresh(mapping)

        return self.get_by_id(mapping.id)

    def get_by_id(
        self,
        mapping_id: int,
    ):
        return (
            self.db.query(AutomationTestMapping)
            .options(
                selectinload(
                    AutomationTestMapping.automation_project
                ),
                selectinload(
                    AutomationTestMapping.test_case
                ),
            )
            .filter(
                AutomationTestMapping.id
                == mapping_id
            )
            .first()
        )

    def get_by_automation_project(
        self,
        automation_project_id: int,
    ):
        return (
            self.db.query(AutomationTestMapping)
            .options(
                selectinload(
                    AutomationTestMapping.test_case
                ),
            )
            .filter(
                AutomationTestMapping.automation_project_id
                == automation_project_id
            )
            .all()
        )

    def get_by_test_case(
        self,
        automation_project_id: int,
        test_case_id: int,
    ):
        return (
            self.db.query(AutomationTestMapping)
            .filter(
                AutomationTestMapping.automation_project_id
                == automation_project_id,
                AutomationTestMapping.test_case_id
                == test_case_id,
            )
            .first()
        )

    def update(
        self,
        mapping: AutomationTestMapping,
    ):
        self.db.commit()
        self.db.refresh(mapping)

        return self.get_by_id(mapping.id)

    def delete(
        self,
        mapping: AutomationTestMapping,
    ):
        self.db.delete(mapping)
        self.db.commit()