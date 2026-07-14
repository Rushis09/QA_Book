from app.models.requirement import Requirement
from app.repositories.requirement_repository import RequirementRepository
from app.schemas.requirement import (
    RequirementCreate,
    RequirementUpdate,
)


class RequirementService:
    """Business logic for Requirements."""

    def __init__(self, repository: RequirementRepository):
        self.repository = repository

    def create(self, requirement_data: RequirementCreate) -> Requirement:

        last_requirement = self.repository.get_last()

        next_number = 1

        if last_requirement:
            next_number = last_requirement.id + 1

        requirement_code = f"REQ-{next_number:03d}"

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