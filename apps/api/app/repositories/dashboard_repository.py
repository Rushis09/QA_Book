from sqlalchemy import case, func
from sqlalchemy.orm import Session

from app.automation.models.automation_project import (
    AutomationProject,
)
from app.automation.models.automation_test_mapping import (
    AutomationTestMapping,
)
from app.automation.models.github_connection import (
    GitHubConnection,
)
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

    def get_dashboard_summary(
        self,
        admin: Admin,
    ):
        project_scope = self._project_scope(admin)

        project_count = (
            self.db.query(Project)
            .filter(project_scope)
            .count()
        )

        requirement_count = (
            self.db.query(Requirement)
            .filter(
                Requirement.project_id.in_(
                    self._project_ids(admin)
                )
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
            .filter(
                Requirement.project_id.in_(
                    self._project_ids(admin)
                )
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
            .filter(
                Requirement.project_id.in_(
                    self._project_ids(admin)
                )
            )
            .count()
        )

        test_suite_count = (
            self.db.query(TestSuite)
            .filter(
                TestSuite.project_id.in_(
                    self._project_ids(admin)
                )
            )
            .count()
        )

        test_run_count = (
            self.db.query(TestRun)
            .join(
                TestSuite,
                TestRun.suite_id
                == TestSuite.id,
            )
            .filter(
                TestSuite.project_id.in_(
                    self._project_ids(admin)
                )
            )
            .count()
        )

        test_execution_count = (
            self.db.query(TestExecution)
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
            .filter(
                TestSuite.project_id.in_(
                    self._project_ids(admin)
                )
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
            .filter(
                TestSuite.project_id.in_(
                    self._project_ids(admin)
                )
            )
            .count()
        )

        execution_health = (
            self._get_execution_health(admin)
        )

        defect_health = (
            self._get_defect_health(admin)
        )

        requirement_health = (
            self._get_requirement_health(admin)
        )

        automation_health = (
            self._get_automation_health(admin)
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
            "overall_pass_rate": execution_health[
                "pass_percentage"
            ],
            "execution_health": execution_health,
            "defect_health": defect_health,
            "requirement_health": requirement_health,
            "automation_health": automation_health,
        }

    def _project_ids(
        self,
        admin: Admin,
    ):
        query = self.db.query(Project.id)

        if admin.role != "PLATFORM_ADMIN":
            query = query.filter(
                Project.admin_id == admin.id
            )

        return query.subquery()

    def _project_scope(
        self,
        admin: Admin,
    ):
        if admin.role == "PLATFORM_ADMIN":
            return True

        return Project.admin_id == admin.id

    def _get_execution_health(
        self,
        admin: Admin,
    ):
        project_ids = self._project_ids(admin)

        row = (
            self.db.query(
                func.count(
                    TestExecution.id
                ).label("total"),
                func.sum(
                    case(
                        (
                            TestExecution.status
                            == "Passed",
                            1,
                        ),
                        else_=0,
                    )
                ).label("passed"),
                func.sum(
                    case(
                        (
                            TestExecution.status
                            == "Failed",
                            1,
                        ),
                        else_=0,
                    )
                ).label("failed"),
                func.sum(
                    case(
                        (
                            TestExecution.status
                            == "Blocked",
                            1,
                        ),
                        else_=0,
                    )
                ).label("blocked"),
                func.sum(
                    case(
                        (
                            TestExecution.status
                            == "Not Executed",
                            1,
                        ),
                        else_=0,
                    )
                ).label("not_executed"),
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
            .filter(
                TestSuite.project_id.in_(
                    project_ids
                )
            )
            .one()
        )

        total = row.total or 0
        passed = row.passed or 0
        failed = row.failed or 0
        blocked = row.blocked or 0
        not_executed = row.not_executed or 0

        executed = (
            passed
            + failed
            + blocked
        )

        execution_percentage = (
            round(
                (executed / total) * 100,
                2,
            )
            if total > 0
            else 0
        )

        pass_percentage = (
            round(
                (passed / executed) * 100,
                2,
            )
            if executed > 0
            else 0
        )

        return {
            "total": total,
            "passed": passed,
            "failed": failed,
            "blocked": blocked,
            "not_executed": not_executed,
            "executed": executed,
            "execution_percentage": execution_percentage,
            "pass_percentage": pass_percentage,
        }

    def _get_defect_health(
        self,
        admin: Admin,
    ):
        project_ids = self._project_ids(admin)

        row = (
            self.db.query(
                func.count(Bug.id).label(
                    "total"
                ),
                func.sum(
                    case(
                        (
                            Bug.status.in_(
                                [
                                    "Open",
                                    "Triaged",
                                ]
                            ),
                            1,
                        ),
                        else_=0,
                    )
                ).label("open"),
                func.sum(
                    case(
                        (
                            Bug.status.in_(
                                [
                                    "In Progress",
                                    "Ready for QA",
                                    "Retesting",
                                ]
                            ),
                            1,
                        ),
                        else_=0,
                    )
                ).label("in_progress"),
                func.sum(
                    case(
                        (
                            Bug.status
                            == "Fixed",
                            1,
                        ),
                        else_=0,
                    )
                ).label("fixed"),
                func.sum(
                    case(
                        (
                            Bug.status
                            == "Closed",
                            1,
                        ),
                        else_=0,
                    )
                ).label("closed"),
                func.sum(
                    case(
                        (
                            Bug.status
                            == "Reopened",
                            1,
                        ),
                        else_=0,
                    )
                ).label("reopened"),
            )
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
            .filter(
                TestSuite.project_id.in_(
                    project_ids
                )
            )
            .one()
        )

        return {
            "total": row.total or 0,
            "open": row.open or 0,
            "in_progress": row.in_progress or 0,
            "fixed": row.fixed or 0,
            "closed": row.closed or 0,
            "reopened": row.reopened or 0,
        }

    def _get_requirement_health(
        self,
        admin: Admin,
    ):
        project_ids = self._project_ids(admin)

        total = (
            self.db.query(Requirement)
            .filter(
                Requirement.project_id.in_(
                    project_ids
                )
            )
            .count()
        )

        covered = (
            self.db.query(
                func.count(
                    func.distinct(
                        Requirement.id
                    )
                )
            )
            .join(
                TestScenario,
                TestScenario.requirement_id
                == Requirement.id,
            )
            .join(
                TestCase,
                TestCase.scenario_id
                == TestScenario.id,
            )
            .filter(
                Requirement.project_id.in_(
                    project_ids
                )
            )
            .scalar()
            or 0
        )

        coverage_percentage = (
            round(
                (covered / total) * 100,
                2,
            )
            if total > 0
            else 0
        )

        return {
            "total": total,
            "covered": covered,
            "coverage_percentage": coverage_percentage,
        }

    def _get_automation_health(
        self,
        admin: Admin,
    ):
        project_ids = self._project_ids(admin)

        automation_projects = (
            self.db.query(
                AutomationProject
            )
            .filter(
                AutomationProject.project_id.in_(
                    project_ids
                )
            )
            .count()
        )

        mapped_test_cases = (
            self.db.query(
                func.count(
                    func.distinct(
                        AutomationTestMapping.test_case_id
                    )
                )
            )
            .join(
                AutomationProject,
                AutomationTestMapping.automation_project_id
                == AutomationProject.id,
            )
            .filter(
                AutomationProject.project_id.in_(
                    project_ids
                )
            )
            .scalar()
            or 0
        )

        github_connections = (
            self.db.query(
                func.count(
                    GitHubConnection.id
                )
            )
            .join(
                AutomationProject,
                GitHubConnection.automation_project_id
                == AutomationProject.id,
            )
            .filter(
                AutomationProject.project_id.in_(
                    project_ids
                )
            )
            .scalar()
            or 0
        )

        return {
            "automation_projects": automation_projects,
            "mapped_test_cases": mapped_test_cases,
            "github_connections": github_connections,
        }