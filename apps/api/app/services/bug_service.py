from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.bug import Bug
from app.repositories.bug_repository import (
    BugRepository,
)
from app.schemas.bug import (
    BugCreate,
    BugUpdate,
)
from app.models.test_execution import TestExecution

from datetime import datetime

class BugService:
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
        last_bug = self.repository.get_last_bug()

        if last_bug:
            next_number = last_bug.id + 1
        else:
            next_number = 1
        
        bug_code = f"BUG-{next_number:03d}"

        bug = Bug(
            bug_code=bug_code,
            execution_id=data.execution_id,
            title=data.title,
            description=data.description,
            severity=data.severity,
            priority=data.priority,
            status=data.status,
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

        bug.execution_id = (
            data.execution_id
        )

        bug.title = data.title
        bug.description = (
            data.description
        )
        bug.severity = data.severity
        bug.priority = data.priority
        bug.status = data.status
        bug.assigned_to = (
            data.assigned_to
        )
        bug.reported_by = (
            data.reported_by
        )
        bug.environment = (
            data.environment
        )
        bug.steps_to_reproduce = (
            data.steps_to_reproduce
        )

        bug.actual_result = (
            data.actual_result
        )
        bug.updated_at = (
            datetime.now()
        )

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