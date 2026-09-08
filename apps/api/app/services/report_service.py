from app.models.admin import Admin
from app.models.project import Project
from app.repositories.report_repository import ReportRepository


class ReportService:
    def __init__(
        self,
        db,
    ):
        self.repository = ReportRepository(db)

    # ============================================================
    # Project access
    # ============================================================

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

    # ============================================================
    # Reports
    # ============================================================

    def get_overview(
        self,
        admin: Admin,
        project_id: int | None = None,
    ):
        project_ids = self.get_report_project_ids(
            admin=admin,
            project_id=project_id,
        )

        inventory = (
            self.repository.get_inventory(
                project_ids=project_ids,
            )
        )

        execution_health = (
            self.repository._execution_health(
                project_ids=project_ids,
            )
        )

        coverage = (
            self.repository.get_coverage_analytics(
                project_ids=project_ids,
            )
        )

        defects = (
            self.repository.get_defect_analytics(
                project_ids=project_ids,
            )
        )

        return {
            "project": (
                self.repository.get_project_context(
                    project_ids=project_ids,
                )
            ),
            "inventory": inventory,
            "execution_health": execution_health,
            "coverage_health": {
                "requirement_coverage": (
                    coverage["summary"][
                        "requirement_coverage"
                    ]
                ),
                "scenario_coverage": (
                    coverage["summary"][
                        "scenario_coverage"
                    ]
                ),
                "execution_coverage": (
                    coverage["summary"][
                        "execution_coverage"
                    ]
                ),
            },
            "defect_health": {
                "total": defects["summary"]["total"],
                "open": defects["summary"]["open"],
                "in_progress": defects["summary"][
                    "in_progress"
                ],
                "fixed": defects["summary"]["fixed"],
                "ready_for_qa": defects["summary"][
                    "ready_for_qa"
                ],
                "retesting": defects["summary"][
                    "retesting"
                ],
                "closed": defects["summary"]["closed"],
                "reopened": defects["summary"]["reopened"],
                "critical_open": defects["summary"][
                    "critical_open"
                ],
                "high_open": defects["summary"][
                    "high_open"
                ],
            },
        }

    def get_execution_analytics(
        self,
        admin: Admin,
        project_id: int | None = None,
    ):
        project_ids = self.get_report_project_ids(
            admin=admin,
            project_id=project_id,
        )

        return (
            self.repository.get_execution_analytics(
                project_ids=project_ids,
            )
        )

    def get_coverage_analytics(
        self,
        admin: Admin,
        project_id: int | None = None,
    ):
        project_ids = self.get_report_project_ids(
            admin=admin,
            project_id=project_id,
        )

        return (
            self.repository.get_coverage_analytics(
                project_ids=project_ids,
            )
        )

    def get_defect_analytics(
        self,
        admin: Admin,
        project_id: int | None = None,
    ):
        project_ids = self.get_report_project_ids(
            admin=admin,
            project_id=project_id,
        )

        return (
            self.repository.get_defect_analytics(
                project_ids=project_ids,
            )
        )

    def get_quality_risk(
        self,
        admin: Admin,
        project_id: int | None = None,
    ):
        project_ids = self.get_report_project_ids(
            admin=admin,
            project_id=project_id,
        )

        return (
            self.repository.get_quality_risk(
                project_ids=project_ids,
            )
        )

    def get_traceability_analytics(
        self,
        admin: Admin,
        project_id: int | None = None,
    ):
        project_ids = self.get_report_project_ids(
            admin=admin,
            project_id=project_id,
        )

        return (
            self.repository.get_traceability_analytics(
                project_ids=project_ids,
            )
        )

    # ============================================================
    # Authorization
    # ============================================================

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