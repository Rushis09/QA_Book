from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.automation.models.automation_test_mapping import (
    AutomationTestMapping,
)
from app.automation.repositories.automation_project_repository import (
    AutomationProjectRepository,
)
from app.automation.repositories.automation_test_mapping_repository import (
    AutomationTestMappingRepository,
)
from app.automation.schemas.automation_test_mapping import (
    AutomationTestMappingBulkCreate,
    AutomationTestMappingCreate,
    AutomationTestMappingUpdate,
)
from app.models.test_case import TestCase


class AutomationTestMappingService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = AutomationTestMappingRepository(db)
        self.automation_project_repository = AutomationProjectRepository(db)

    def create(self, data: AutomationTestMappingCreate):
        automation_project = (
            self.automation_project_repository.get_by_id(
                data.automation_project_id
            )
        )

        if not automation_project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Automation project not found",
            )

        existing = self.repository.get_by_test_case(
            data.automation_project_id,
            data.test_case_id,
        )

        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Test case is already mapped to this automation project",
            )

        mapping = AutomationTestMapping(
            automation_project_id=data.automation_project_id,
            test_case_id=data.test_case_id,
            test_name=data.test_name,
            test_file_path=data.test_file_path,
        )

        return self.repository.create(mapping)

    def bulk_create(
        self,
        data: AutomationTestMappingBulkCreate,
    ):
        automation_project = (
            self.automation_project_repository.get_by_id(
                data.automation_project_id
            )
        )

        if not automation_project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Automation project not found",
            )

        if not data.test_case_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one test case is required",
            )

        unique_test_case_ids = list(
            dict.fromkeys(data.test_case_ids)
        )

        test_cases = (
            self.db.query(TestCase)
            .filter(
                TestCase.id.in_(unique_test_case_ids)
            )
            .all()
        )

        test_cases_by_id = {
            test_case.id: test_case
            for test_case in test_cases
        }

        missing_test_case_ids = [
            test_case_id
            for test_case_id in unique_test_case_ids
            if test_case_id not in test_cases_by_id
        ]

        if missing_test_case_ids:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    "Test cases not found: "
                    + ", ".join(
                        str(test_case_id)
                        for test_case_id in missing_test_case_ids
                    )
                ),
            )

        existing_mappings = (
            self.db.query(AutomationTestMapping)
            .filter(
                AutomationTestMapping.automation_project_id
                == data.automation_project_id,
                AutomationTestMapping.test_case_id.in_(
                    unique_test_case_ids
                ),
            )
            .all()
        )

        existing_test_case_ids = {
            mapping.test_case_id
            for mapping in existing_mappings
        }

        new_mappings = []

        for test_case_id in unique_test_case_ids:
            if test_case_id in existing_test_case_ids:
                continue

            test_case = test_cases_by_id[test_case_id]

            test_case_code = test_case.test_case_code.lower()

            new_mappings.append(
                AutomationTestMapping(
                    automation_project_id=data.automation_project_id,
                    test_case_id=test_case_id,
                    test_name=f"test_{test_case_code}",
                    test_file_path=(
                        f"tests/{test_case_code}.py"
                    ),
                )
            )

        if new_mappings:
            self.db.add_all(new_mappings)
            self.db.commit()

        return (
            self.repository.get_by_automation_project(
                data.automation_project_id
            )
        )

    def get_by_id(self, mapping_id: int):
        mapping = self.repository.get_by_id(mapping_id)

        if not mapping:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Automation test mapping not found",
            )

        return mapping

    def get_by_automation_project(
        self,
        automation_project_id: int,
    ):
        automation_project = (
            self.automation_project_repository.get_by_id(
                automation_project_id
            )
        )

        if not automation_project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Automation project not found",
            )

        return self.repository.get_by_automation_project(
            automation_project_id
        )

    def update(
        self,
        mapping_id: int,
        data: AutomationTestMappingUpdate,
    ):
        mapping = self.repository.get_by_id(mapping_id)

        if not mapping:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Automation test mapping not found",
            )

        mapping.test_name = data.test_name
        mapping.test_file_path = data.test_file_path

        return self.repository.update(mapping)

    def delete(self, mapping_id: int):
        mapping = self.repository.get_by_id(mapping_id)

        if not mapping:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Automation test mapping not found",
            )

        self.repository.delete(mapping)