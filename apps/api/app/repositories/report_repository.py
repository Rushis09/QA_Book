from sqlalchemy.orm import Session

from app.models.bug import Bug
from app.models.project import Project
from app.models.requirement import Requirement
from app.models.test_case import TestCase
from app.models.test_execution import TestExecution
from app.models.test_run import TestRun
from app.models.test_scenario import TestScenario
from app.models.test_suite import TestSuite


class ReportRepository:
    def __init__(
        self,
        db: Session,
    ):
        self.db = db

    def get_execution_summary(
        self,
        project_ids: list[int] | None = None,
    ):
        query = (
            self.db.query(TestExecution)
            .join(
                TestRun,
                TestExecution.run_id == TestRun.id,
            )
            .join(
                TestSuite,
                TestRun.suite_id == TestSuite.id,
            )
        )

        if project_ids is not None:
            query = query.filter(
                TestSuite.project_id.in_(project_ids)
            )

        total = query.count()

        passed = (
            query.filter(
                TestExecution.status == "Passed",
            )
            .count()
        )

        failed = (
            query.filter(
                TestExecution.status == "Failed",
            )
            .count()
        )

        blocked = (
            query.filter(
                TestExecution.status == "Blocked",
            )
            .count()
        )

        not_executed = (
            query.filter(
                TestExecution.status == "Not Executed",
            )
            .count()
        )

        pass_percentage = (
            round(
                (passed / total) * 100,
                2,
            )
            if total > 0
            else 0
        )

        return {
            "total": total,
            "passed": passed,
            "failed": failed,
            "blocked": blocked,
            "not_executed": not_executed,
            "pass_percentage": pass_percentage,
        }

    def get_bug_summary(
        self,
        project_ids: list[int] | None = None,
    ):
        query = (
            self.db.query(Bug)
            .join(
                TestExecution,
                Bug.execution_id == TestExecution.id,
            )
            .join(
                TestRun,
                TestExecution.run_id == TestRun.id,
            )
            .join(
                TestSuite,
                TestRun.suite_id == TestSuite.id,
            )
        )

        if project_ids is not None:
            query = query.filter(
                TestSuite.project_id.in_(project_ids)
            )

        total = query.count()

        open_count = (
            query.filter(
                Bug.status == "Open",
            )
            .count()
        )

        in_progress = (
            query.filter(
                Bug.status == "In Progress",
            )
            .count()
        )

        fixed = (
            query.filter(
                Bug.status == "Fixed",
            )
            .count()
        )

        closed = (
            query.filter(
                Bug.status == "Closed",
            )
            .count()
        )

        reopened = (
            query.filter(
                Bug.status == "Reopened",
            )
            .count()
        )

        return {
            "total": total,
            "open": open_count,
            "in_progress": in_progress,
            "fixed": fixed,
            "closed": closed,
            "reopened": reopened,
        }

    def get_requirement_coverage(
        self,
        project_ids: list[int] | None = None,
    ):
        query = self.db.query(Requirement)

        if project_ids is not None:
            query = query.filter(
                Requirement.project_id.in_(project_ids)
            )

        requirements = query.all()

        coverage = []

        for requirement in requirements:
            scenario_count = len(
                requirement.test_scenarios
            )

            test_case_count = sum(
                len(scenario.test_cases)
                for scenario in requirement.test_scenarios
            )

            coverage_percentage = (
                100.0
                if scenario_count > 0
                else 0.0
            )

            coverage.append(
                {
                    "requirement_id": requirement.id,
                    "requirement_code": requirement.requirement_code,
                    "module": requirement.module,
                    "scenario_count": scenario_count,
                    "test_case_count": test_case_count,
                    "coverage_percentage": coverage_percentage,
                }
            )

        return coverage

    def get_traceability(
        self,
        project_ids: list[int] | None = None,
    ):
        query = self.db.query(Requirement)

        if project_ids is not None:
            query = query.filter(
                Requirement.project_id.in_(project_ids)
            )

        requirements = query.all()

        traceability = []

        for requirement in requirements:
            for scenario in requirement.test_scenarios:
                for test_case in scenario.test_cases:

                    execution_query = (
                        self.db.query(TestExecution)
                        .join(
                            TestRun,
                            TestExecution.run_id == TestRun.id,
                        )
                        .join(
                            TestSuite,
                            TestRun.suite_id == TestSuite.id,
                        )
                        .filter(
                            TestExecution.test_case_id
                            == test_case.id,
                        )
                    )

                    if project_ids is not None:
                        execution_query = execution_query.filter(
                            TestSuite.project_id.in_(project_ids)
                        )

                    execution = (
                        execution_query
                        .order_by(
                            TestExecution.id.desc()
                        )
                        .first()
                    )

                    bug = None

                    if execution:
                        bug = (
                            self.db.query(Bug)
                            .filter(
                                Bug.execution_id
                                == execution.id,
                            )
                            .first()
                        )

                    traceability.append(
                        {
                            "requirement_code": requirement.requirement_code,
                            "scenario_code": scenario.scenario_code,
                            "test_case_code": test_case.test_case_code,
                            "execution_status": (
                                execution.status
                                if execution
                                else None
                            ),
                            "bug_code": (
                                bug.bug_code
                                if bug
                                else None
                            ),
                        }
                    )

        return traceability