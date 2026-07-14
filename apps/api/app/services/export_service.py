from datetime import datetime

from app.exports.constants import ExportConstants
from app.exports.requirement_exporter import RequirementExporter
from app.repositories.project_repository import ProjectRepository
from app.repositories.requirement_repository import RequirementRepository


class ExportService:
    """Business logic for QABook exports."""

    def __init__(
        self,
        project_repository: ProjectRepository,
        requirement_repository: RequirementRepository,
    ):
        self.project_repository = project_repository
        self.requirement_repository = requirement_repository

    def export_requirements(self, project_id: int):

        project = self.project_repository.get_by_id(project_id)

        if project is None:
            raise ValueError("Project not found")

        requirements = self.requirement_repository.get_by_project(project_id)

        metadata = {
            ExportConstants.PROJECT_NAME_LABEL: project.name,
            ExportConstants.PROJECT_CODE_LABEL: project.project_code,
            ExportConstants.GENERATED_BY_LABEL: "QABook",
            ExportConstants.GENERATED_DATE_LABEL: datetime.now().strftime("%d-%b-%Y %H:%M"),
            ExportConstants.VERSION_LABEL: ExportConstants.QDS_VERSION,
        }

        exporter = RequirementExporter()

        return exporter.generate(
            metadata=metadata,
            requirements=[
                {
                    "requirement_code": requirement.requirement_code,
                    "module": requirement.module,
                    "priority": requirement.priority,
                    "status": requirement.status,
                    "description": requirement.description,
                }
                for requirement in requirements
            ],
        )