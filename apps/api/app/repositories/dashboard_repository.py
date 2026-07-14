from sqlalchemy.orm import Session
from app.models.project import Project
from app.models.requirement import Requirement
from app.models.test_scenario import TestScenario
from app.models.test_case import TestCase
from app.models.test_suite import TestSuite
from app.models.test_run import TestRun
from app.models.test_execution import TestExecution
from app.models.bug import Bug


class DashboardRepository:
    def __init__(
        self,
        db: Session,
    ):
        self.db = db

    def get_dashboard_summary(
        self,
    ):
        project_count = (
            self.db.query(Project).count()
        )

        requirement_count = (
            self.db.query(Requirement).count()
        )

        test_scenario_count = (
            self.db.query(TestScenario).count()
        )

        test_case_count = (
            self.db.query(TestCase).count()
        )

        test_suite_count = (
            self.db.query(TestSuite).count()
        )

        test_run_count = (
            self.db.query(TestRun).count()
        )

        test_execution_count = (
            self.db.query(TestExecution).count()
        )

        bug_count = (
            self.db.query(Bug).count()
        )

        return {
            "projects": project_count,
            "requirements": requirement_count,
            "test_scenarios": test_scenario_count,
            "test_cases": test_case_count,
            "test_suites": test_suite_count,
            "test_runs": test_run_count,
            "test_executions": test_execution_count,
            "bugs": bug_count,
            "overall_pass_rate": 0,
        }