from sqlalchemy.orm import Session

from app.repositories.dashboard_repository import (
    DashboardRepository,
)


class DashboardService:
    def __init__(
        self,
        db: Session,
    ):
        self.repository = (
            DashboardRepository(db)
        )

    def get_dashboard_summary(
        self,
    ):
        return (
            self.repository.get_dashboard_summary()
        )