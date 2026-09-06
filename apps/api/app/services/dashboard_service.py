from sqlalchemy.orm import Session

from app.models.admin import Admin
from app.repositories.dashboard_repository import (
    DashboardRepository,
)


class DashboardService:
    def __init__(
        self,
        db: Session,
    ):
        self.repository = DashboardRepository(db)

    def get_dashboard_summary(
        self,
        admin: Admin,
    ):
        return self.repository.get_dashboard_summary(
            admin,
        )