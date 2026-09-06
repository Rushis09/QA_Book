from sqlalchemy.orm import Session

from app.models.admin import Admin
from app.models.bug import Bug
from app.models.project import Project
from app.models.requirement import Requirement
from app.models.test_case import TestCase
from app.models.test_execution import TestExecution
from app.models.test_run import TestRun
from app.models.test_scenario import TestScenario
from app.models.test_suite import TestSuite


class DashboardRepository:
    def __init__(
        self,
        db: Session,
    ):
        self.db = db

    def _project_scope_query(
        self,
        model,
        admin: Admin,
    ):
        query = self.db.query(model)

        if admin.role != "PLATFORM_ADMIN":
            query = query.join(
                Project,
                model.project_id == Project.id,
            ).filter(
                Project.admin_id == admin.id,
            )

        return query

    def get_dashboard_summary(
        self,
        admin: Admin,
    ):
        if admin.role == "PLATFORM_ADMIN":
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

        else:
            project_count = (
                self.db.query(Project)
                .filter(
                    Project.admin_id == admin.id,
                )
                .count()
            )

            requirement_count = (
                self.db.query(Requirement)
                .join(
                    Project,
                    Requirement.project_id == Project.id,
                )
                .filter(
                    Project.admin_id == admin.id,
                )
                .count()
            )

            test_scenario_count = (
                self.db.query(TestScenario)
                .join(
                    Requirement,
                    TestScenario.requirement_id
                    == Requirement.id,
                )
                .join(
                    Project,
                    Requirement.project_id
                    == Project.id,
                )
                .filter(
                    Project.admin_id == admin.id,
                )
                .count()
            )

            test_case_count = (
                self.db.query(TestCase)
                .join(
                    TestScenario,
                    TestCase.scenario_id
                    == TestScenario.id,
                )
                .join(
                    Requirement,
                    TestScenario.requirement_id
                    == Requirement.id,
                )
                .join(
                    Project,
                    Requirement.project_id
                    == Project.id,
                )
                .filter(
                    Project.admin_id == admin.id,
                )
                .count()
            )

            test_suite_count = (
                self.db.query(TestSuite)
                .join(
                    Project,
                    TestSuite.project_id == Project.id,
                )
                .filter(
                    Project.admin_id == admin.id,
                )
                .count()
            )

            test_run_count = (
                self.db.query(TestRun)
                .join(
                    TestSuite,
                    TestRun.suite_id == TestSuite.id,
                )
                .join(
                    Project,
                    TestSuite.project_id == Project.id,
                )
                .filter(
                    Project.admin_id == admin.id,
                )
                .count()
            )

            test_execution_count = (
                self.db.query(TestExecution)
                .join(
                    TestRun,
                    TestExecution.run_id == TestRun.id,
                )
                .join(
                    TestSuite,
                    TestRun.suite_id == TestSuite.id,
                )
                .join(
                    Project,
                    TestSuite.project_id == Project.id,
                )
                .filter(
                    Project.admin_id == admin.id,
                )
                .count()
            )

            bug_count = (
                self.db.query(Bug)
                .join(
                    TestExecution,
                    Bug.execution_id
                    == TestExecution.id,
                )
                .join(
                    TestRun,
                    TestExecution.run_id
                    == TestRun.id,
                )
                .join(
                    TestSuite,
                    TestRun.suite_id
                    == TestSuite.id,
                )
                .join(
                    Project,
                    TestSuite.project_id
                    == Project.id,
                )
                .filter(
                    Project.admin_id == admin.id,
                )
                .count()
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