from app.models.admin import Admin
from app.models.project import Project
from app.models.requirement import Requirement
from app.repositories.requirement_repository import RequirementRepository
from app.schemas.requirement import (
    RequirementCreate,
    RequirementUpdate,
)
from app.utils.code_generator import generate_sequential_code


class RequirementService:
    """Business logic for Requirements."""

    def __init__(
        self,
        repository: RequirementRepository,
    ):
        self.repository = repository

    def create(
        self,
        requirement_data: RequirementCreate,
        admin: Admin,
    ) -> Requirement:

        self._validate_project_access(
            project_id=requirement_data.project_id,
            admin=admin,
        )

        requirement_code = generate_sequential_code(
            db=self.repository.session,
            entity_type="requirement",
            prefix="REQ",
        )

        requirement = Requirement(
            requirement_code=requirement_code,
            project_id=requirement_data.project_id,
            module=requirement_data.module,
            priority=requirement_data.priority,
            status=requirement_data.status,
            description=requirement_data.description,
        )

        return self.repository.create(requirement)

    def get_all(
        self,
        admin: Admin,
    ):
        if admin.role == "PLATFORM_ADMIN":
            return self.repository.get_all()

        return self.repository.get_by_owner(
            admin.id,
        )

    def get_by_project(
        self,
        project_id: int,
        admin: Admin,
    ):
        self._validate_project_access(
            project_id=project_id,
            admin=admin,
        )

        return self.repository.get_by_project(
            project_id,
        )

    def get_by_id(
        self,
        requirement_id: int,
        admin: Admin,
    ):
        requirement = self.repository.get_by_id(
            requirement_id,
        )

        if requirement is None:
            return None

        self._validate_requirement_access(
            requirement=requirement,
            admin=admin,
        )

        return requirement

    def get_required(
        self,
        requirement_id: int,
        admin: Admin,
    ) -> Requirement:

        requirement = self.repository.get_by_id(
            requirement_id,
        )

        if requirement is None:
            raise ValueError(
                "Requirement not found"
            )

        self._validate_requirement_access(
            requirement=requirement,
            admin=admin,
        )

        return requirement

    def update(
        self,
        requirement: Requirement,
        requirement_data: RequirementUpdate,
        admin: Admin,
    ):

        self._validate_requirement_access(
            requirement=requirement,
            admin=admin,
        )

        self._validate_project_access(
            project_id=requirement_data.project_id,
            admin=admin,
        )

        requirement.project_id = (
            requirement_data.project_id
        )
        requirement.module = (
            requirement_data.module
        )
        requirement.priority = (
            requirement_data.priority
        )
        requirement.status = (
            requirement_data.status
        )
        requirement.description = (
            requirement_data.description
        )

        return self.repository.update(
            requirement
        )

    def delete(
        self,
        requirement: Requirement,
        admin: Admin,
    ):

        self._validate_requirement_access(
            requirement=requirement,
            admin=admin,
        )

        self.repository.delete(
            requirement
        )

    def _validate_project_access(
        self,
        project_id: int,
        admin: Admin,
    ):

        project = (
            self.repository.session
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

    def _validate_requirement_access(
        self,
        requirement: Requirement,
        admin: Admin,
    ):

        if admin.role == "PLATFORM_ADMIN":
            return

        if (
            requirement.project is None
            or requirement.project.admin_id
            != admin.id
        ):
            raise ValueError(
                "You do not have access to this requirement."
            )