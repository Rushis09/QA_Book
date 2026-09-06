from app.models.admin import Admin
from app.models.project import Project
from app.repositories.report_repository import ReportRepository


class ReportService:
    def __init__(
        self,
        db,
    ):
        self.repository = ReportRepository(db)

    def get_report_project_ids(
        self,
        admin: Admin,
        project_id: int | None = None,
    ) -> list[int] | None:
        if project_id is not None:
            self._validate_project_access(
                project_id=project_id,
                admin=admin,
            )

            return [project_id]

        if admin.role == "PLATFORM_ADMIN":
            return None

        projects = (
            self.repository.db
            .query(Project.id)
            .filter(
                Project.admin_id == admin.id
            )
            .all()
        )

        return [
            project.id
            for project in projects
        ]

    def get_summary(
        self,
        admin: Admin,
        project_id: int | None = None,
    ):
        project_ids = self.get_report_project_ids(
            admin=admin,
            project_id=project_id,
        )

        return {
            "execution_summary": (
                self.repository.get_execution_summary(
                    project_ids=project_ids,
                )
            ),
            "bug_summary": (
                self.repository.get_bug_summary(
                    project_ids=project_ids,
                )
            ),
        }

    def get_requirement_coverage(
        self,
        admin: Admin,
        project_id: int | None = None,
    ):
        project_ids = self.get_report_project_ids(
            admin=admin,
            project_id=project_id,
        )

        return (
            self.repository.get_requirement_coverage(
                project_ids=project_ids,
            )
        )

    def get_traceability(
        self,
        admin: Admin,
        project_id: int | None = None,
    ):
        project_ids = self.get_report_project_ids(
            admin=admin,
            project_id=project_id,
        )

        return (
            self.repository.get_traceability(
                project_ids=project_ids,
            )
        )

    def _validate_project_access(
        self,
        project_id: int,
        admin: Admin,
    ):
        project = (
            self.repository.db
            .query(Project)
            .filter(
                Project.id == project_id
            )
            .first()
        )

        if project is None:
            raise ValueError(
                "Project not found"
            )

        if (
            admin.role != "PLATFORM_ADMIN"
            and project.admin_id != admin.id
        ):
            raise ValueError(
                "You do not have access to this project."
            )