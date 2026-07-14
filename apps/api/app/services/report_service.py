from sqlalchemy.orm import Session

from app.repositories.report_repository import (
    ReportRepository,
)


class ReportService:
    def __init__(
        self,
        db: Session,
    ):
        self.repository = (
            ReportRepository(db)
        )

    def get_summary(
        self,
    ):
        return {
            "execution_summary": (
                self.repository.get_execution_summary()
            ),
            "bug_summary": (
                self.repository.get_bug_summary()
            ),
        }
    
    def get_requirement_coverage(
        self,
    ):
        return (
            self.repository.get_requirement_coverage()
        )
    
    def get_traceability(
        self,
    ):
        return (
            self.repository.get_traceability()
        )