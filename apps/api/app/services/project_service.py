from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.repositories.project_repository import ProjectRepository
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
)
from app.services.storage_service import StorageService


class ProjectService:
    @staticmethod
    def create_project(
        db: Session,
        project: ProjectCreate,
    ):
        return ProjectRepository.create(
            db,
            project,
        )

    @staticmethod
    def get_projects(
        db: Session,
    ):
        return ProjectRepository.get_all(db)

    @staticmethod
    def get_project(
        db: Session,
        project_id: int,
    ):
        project = ProjectRepository.get_by_id(
            db,
            project_id,
        )

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
        project = ProjectRepository.get_by_id(
            db,
            project_id,
        )

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
    def get_delete_impact(
        db: Session,
        project_id: int,
    ):
        project = ProjectRepository.get_by_id(
            db,
            project_id,
        )

        if not project:
            raise HTTPException(
                status_code=404,
                detail="Project not found",
            )

        # ---------------------------------
        # QA DATA COUNTS
        # ---------------------------------

        requirement_count = len(
            project.requirements
        )

        scenario_count = sum(
            len(requirement.test_scenarios)
            for requirement in project.requirements
        )

        test_case_count = sum(
            len(scenario.test_cases)
            for requirement in project.requirements
            for scenario in requirement.test_scenarios
        )

        test_suite_count = len(
            project.test_suites
        )

        test_run_count = sum(
            len(suite.test_runs)
            for suite in project.test_suites
        )

        test_execution_count = sum(
            len(test_run.executions)
            for suite in project.test_suites
            for test_run in suite.test_runs
        )

        bug_count = sum(
            len(execution.bugs)
            for suite in project.test_suites
            for test_run in suite.test_runs
            for execution in test_run.executions
        )

        bug_retest_count = sum(
            len(execution.bug_retests)
            for suite in project.test_suites
            for test_run in suite.test_runs
            for execution in test_run.executions
        )

        document_count = len(
            project.documents
        )

        # ---------------------------------
        # AUTOMATION
        # ---------------------------------

        from app.automation.models.automation_project import (
            AutomationProject,
        )

        automation_project = (
            db.query(AutomationProject)
            .filter(
                AutomationProject.project_id
                == project.id
            )
            .first()
        )

        automation_enabled = (
            automation_project is not None
        )

        automation_mapping_count = 0
        github_connected = False
        repository_url = None

        if automation_project:
            automation_mapping_count = len(
                automation_project.mappings
            )

            github_connection = (
                automation_project.github_connection
            )

            if github_connection:
                github_connected = True
            
                if (
                    github_connection.repository_owner
                    and github_connection.repository_name
                ):
                    repository_url = (
                        f"https://github.com/"
                        f"{github_connection.repository_owner}/"
                        f"{github_connection.repository_name}"
                    )

        # ---------------------------------
        # DELETE IMPACT RESPONSE
        # ---------------------------------

        return {
            "project_id": project.id,
            "project_code": project.project_code,
            "project_name": project.name,

            "automation_enabled": (
                automation_enabled
            ),

            "counts": {
                "requirements": requirement_count,
                "test_scenarios": scenario_count,
                "test_cases": test_case_count,
                "test_suites": test_suite_count,
                "test_runs": test_run_count,
                "test_executions": test_execution_count,
                "bugs": bug_count,
                "bug_retests": bug_retest_count,
                "documents": document_count,
            },

            "automation": {
                "mapped_test_cases": (
                    automation_mapping_count
                ),
                "github_connected": (
                    github_connected
                ),
                "repository_url": (
                    repository_url
                ),
                "repository_will_be_deleted": False,
            },
        }

    @staticmethod
    def delete_project(
        db: Session,
        project_id: int,
    ):
        project = ProjectRepository.get_by_id(
            db,
            project_id,
        )

        if not project:
            raise HTTPException(
                status_code=404,
                detail="Project not found",
            )

        document_storage_keys = (
            ProjectRepository.delete_project_data(
                db,
                project,
            )
        )

        storage = StorageService()

        document_storage_failures = []

        for storage_key in document_storage_keys:
            try:
                storage.delete_file(
                    storage_key,
                )
            except Exception as error:
                document_storage_failures.append(
                    {
                        "storage_key": storage_key,
                        "error": str(error),
                    }
                )

        return {
            "message": "Project deleted successfully",
            "project_id": project_id,
            "documents_deleted": (
                len(document_storage_keys)
                - len(document_storage_failures)
            ),
            "document_storage_failures": (
                document_storage_failures
            ),
        }