from app.models.requirement import Requirement
from app.repositories.requirement_repository import RequirementRepository
from app.schemas.requirement import (
    RequirementCreate,
    RequirementUpdate,
)
from app.utils.code_generator import generate_sequential_code


class RequirementService:
    """Business logic for Requirements."""

    def __init__(self, repository: RequirementRepository):
        self.repository = repository

    def create(self, requirement_data: RequirementCreate) -> Requirement:

        requirement_code = generate_sequential_code(
            db=self.repository.session,
            model=Requirement,
            project_id=requirement_data.project_id,
            code_field="requirement_code",
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

    def get_all(self):

        return self.repository.get_all()
    
    def get_by_project(self, project_id: int):

        return self.repository.get_by_project(project_id)

    def get_by_id(self, requirement_id: int):

        return self.repository.get_by_id(requirement_id)

    def get_required(self, requirement_id: int) -> Requirement:
        requirement = self.repository.get_by_id(requirement_id)
    
        if requirement is None:
            raise ValueError("Requirement not found")
    
        return requirement

    def update(
        self,
        requirement: Requirement,
        requirement_data: RequirementUpdate,
    ):

        requirement.project_id = requirement_data.project_id
        requirement.module = requirement_data.module
        requirement.priority = requirement_data.priority
        requirement.status = requirement_data.status
        requirement.description = requirement_data.description

        return self.repository.update(requirement)

    def delete(self, requirement: Requirement):

        self.repository.delete(requirement)