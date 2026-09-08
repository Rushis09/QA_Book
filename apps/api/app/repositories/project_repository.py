from sqlalchemy.orm import Session

from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate


class ProjectRepository:
    @staticmethod
    def create(
        db: Session,
        project: ProjectCreate,
    ) -> Project:
        db_project = Project(
            name=project.name,
            description=project.description,
        )

        db.add(db_project)
        db.commit()
        db.refresh(db_project)

        return db_project

    @staticmethod
    def get_all(
        db: Session,
    ) -> list[Project]:
        return db.query(Project).all()

    @staticmethod
    def get_by_id(
        db: Session,
        project_id: int,
    ) -> Project | None:
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
    def delete_project_data(
        db: Session,
        project: Project,
    ) -> list[str]:
        """
        Delete all QABook database data belonging to a project.

        Returns the document storage keys so the caller can
        remove the physical files after the database transaction
        has successfully committed.

        The external GitHub repository is intentionally NOT deleted.
        """

        from app.automation.models.automation_project import (
            AutomationProject,
        )
        from app.models.suite_test_case import SuiteTestCase

        # ---------------------------------------------------------
        # Collect document storage keys before deleting the project
        # ---------------------------------------------------------

        document_storage_keys = [
            document.storage_key
            for document in project.documents
            if document.storage_key
        ]

        # ---------------------------------------------------------
        # Delete project automation configuration
        #
        # Deleting AutomationProject triggers its ORM cascades:
        # - AutomationTestMapping
        # - GitHubConnection
        #
        # The actual GitHub repository is NOT deleted.
        # ---------------------------------------------------------

        automation_project = (
            db.query(AutomationProject)
            .filter(
                AutomationProject.project_id == project.id
            )
            .first()
        )

        if automation_project:
            db.delete(automation_project)

        # ---------------------------------------------------------
        # Delete many-to-many suite/test-case associations
        #
        # SuiteTestCase does not have ORM cascade configured.
        # ---------------------------------------------------------

        suite_ids = [
            suite.id
            for suite in project.test_suites
        ]

        if suite_ids:
            (
                db.query(SuiteTestCase)
                .filter(
                    SuiteTestCase.suite_id.in_(suite_ids)
                )
                .delete(
                    synchronize_session=False
                )
            )

        # ---------------------------------------------------------
        # Delete the project.
        #
        # Existing Project ORM cascades handle:
        #
        # Project
        #   ├── Requirements
        #   │     └── Test Scenarios
        #   │            └── Test Cases
        #   │
        #   ├── Test Suites
        #   │     └── Test Runs
        #   │
        #   └── Documents
        #
        # Existing child cascades then handle:
        #
        # TestCase/TestRun
        #   └── TestExecution
        #          ├── Bug
        #          └── BugRetest
        # ---------------------------------------------------------

        db.delete(project)

        # ---------------------------------------------------------
        # Commit the complete database deletion as one transaction.
        # ---------------------------------------------------------

        db.commit()

        return document_storage_keys

    @staticmethod
    def delete(
        db: Session,
        project: Project,
    ) -> None:
        """
        Backward-compatible simple delete method.

        New project deletion should use delete_project_data().
        """

        ProjectRepository.delete_project_data(
            db,
            project,
        )