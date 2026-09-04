from datetime import datetime

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.bug import Bug
from app.models.test_execution import TestExecution
from app.repositories.bug_repository import BugRepository
from app.schemas.bug import BugCreate, BugUpdate
from app.utils.code_generator import generate_sequential_code


class BugService:
    ALLOWED_TRANSITIONS = {
        "Open": {
            "Open",
            "Triaged",
        },
        "Triaged": {
            "Triaged",
            "In Progress",
            "Closed",
        },
        "In Progress": {
            "In Progress",
            "Fixed",
        },
        "Fixed": {
            "Fixed",
            "Ready for QA",
        },
        "Ready for QA": {
            "Ready for QA",
            "Retesting",
        },
        "Retesting": {
            "Retesting",
            "Closed",
            "Reopened",
        },
        "Reopened": {
            "Reopened",
            "In Progress",
        },
        "Closed": {
            "Closed",
            "Reopened",
        },
    }

    ALTERNATE_CLOSURE_RESOLUTIONS = {
        "Duplicate",
        "Cannot Reproduce",
        "Won't Fix",
        "Not a Bug",
        "By Design",
    }

    def __init__(
        self,
        db: Session,
    ):
        self.db = db
        self.repository = BugRepository(
            db,
        )

    def get_bugs(
        self,
    ):
        return self.repository.get_all()

    def get_bug(
        self,
        bug_id: int,
    ):
        bug = self.repository.get_by_id(
            bug_id,
        )

        if not bug:
            raise HTTPException(
                status_code=404,
                detail="Bug not found",
            )

        return bug

    def create_bug(
        self,
        data: BugCreate,
    ):
        execution = self.db.get(
            TestExecution,
            data.execution_id,
        )

        if not execution:
            raise HTTPException(
                status_code=404,
                detail="Test execution not found",
            )

        bug_code = generate_sequential_code(
            db=self.db,
            entity_type="bug",
            prefix="BUG",
        )

        bug = Bug(
            bug_code=bug_code,
            execution_id=data.execution_id,
            title=data.title,
            description=data.description,
            severity=data.severity,
            priority=data.priority,
            status=data.status,
            resolution=data.resolution,
            assigned_to=data.assigned_to,
            reported_by=data.reported_by,
            environment=data.environment,
            steps_to_reproduce=data.steps_to_reproduce,
            actual_result=data.actual_result,
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )

        return self.repository.create(
            bug,
        )

    def update_bug(
        self,
        bug_id: int,
        data: BugUpdate,
    ):
        execution = self.db.get(
            TestExecution,
            data.execution_id,
        )

        if not execution:
            raise HTTPException(
                status_code=404,
                detail="Test execution not found",
            )

        bug = self.get_bug(
            bug_id,
        )

        self._validate_status_transition(
            current_status=bug.status,
            new_status=data.status,
            resolution=data.resolution,
        )

        bug.execution_id = data.execution_id
        bug.title = data.title
        bug.description = data.description
        bug.severity = data.severity
        bug.priority = data.priority
        bug.status = data.status
        bug.resolution = data.resolution
        bug.assigned_to = data.assigned_to
        bug.reported_by = data.reported_by
        bug.environment = data.environment
        bug.steps_to_reproduce = data.steps_to_reproduce
        bug.actual_result = data.actual_result
        bug.updated_at = datetime.now()

        return self.repository.update(
            bug,
        )

    def delete_bug(
        self,
        bug_id: int,
    ):
        bug = self.get_bug(
            bug_id,
        )

        self.repository.delete(
            bug,
        )

    def _validate_status_transition(
        self,
        current_status: str,
        new_status: str,
        resolution: str | None,
    ):
        allowed_statuses = self.ALLOWED_TRANSITIONS.get(
            current_status,
            set(),
        )

        if new_status not in allowed_statuses:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Invalid Bug status transition: "
                    f"{current_status} → {new_status}."
                ),
            )

        if new_status == "Closed":
            if resolution is None:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "Resolution is required when "
                        "closing a Bug."
                    ),
                )

            if current_status == "Triaged":
                if resolution not in (
                    self.ALTERNATE_CLOSURE_RESOLUTIONS
                    | {"Fixed"}
                ):
                    raise HTTPException(
                        status_code=400,
                        detail=(
                            "Invalid resolution for a Bug "
                            "closed from Triaged."
                        ),
                    )

        elif resolution is not None:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Resolution must be empty unless "
                    "Bug status is Closed."
                ),
            )