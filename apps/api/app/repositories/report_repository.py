from collections import defaultdict
from datetime import date

from sqlalchemy import func
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

    # ============================================================
    # Common helpers
    # ============================================================

    def _apply_project_filter(
        self,
        query,
        project_ids: list[int] | None,
        project_column,
    ):
        if project_ids is not None:
            query = query.filter(
                project_column.in_(project_ids)
            )

        return query

    @staticmethod
    def _percentage(
        numerator: int,
        denominator: int,
    ) -> float:
        if denominator <= 0:
            return 0.0

        return round(
            (numerator / denominator) * 100,
            2,
        )

    # ============================================================
    # Overview
    # ============================================================

    def get_project_context(
        self,
        project_ids: list[int] | None = None,
    ):
        if project_ids is None or len(project_ids) != 1:
            return None

        project = (
            self.db.query(Project)
            .filter(Project.id == project_ids[0])
            .first()
        )

        if not project:
            return None

        return {
            "id": project.id,
            "project_code": project.project_code,
            "name": project.name,
        }

    def get_inventory(
        self,
        project_ids: list[int] | None = None,
    ):
        requirement_query = self.db.query(Requirement)

        scenario_query = self.db.query(TestScenario)

        test_case_query = self.db.query(TestCase)

        suite_query = self.db.query(TestSuite)

        run_query = self.db.query(TestRun).join(
            TestSuite,
            TestRun.suite_id == TestSuite.id,
        )

        execution_query = self.db.query(TestExecution).join(
            TestRun,
            TestExecution.run_id == TestRun.id,
        ).join(
            TestSuite,
            TestRun.suite_id == TestSuite.id,
        )

        bug_query = self.db.query(Bug).join(
            TestExecution,
            Bug.execution_id == TestExecution.id,
        ).join(
            TestRun,
            TestExecution.run_id == TestRun.id,
        ).join(
            TestSuite,
            TestRun.suite_id == TestSuite.id,
        )

        if project_ids is not None:
            requirement_query = requirement_query.filter(
                Requirement.project_id.in_(project_ids)
            )

            scenario_query = scenario_query.join(
                Requirement,
                TestScenario.requirement_id == Requirement.id,
            ).filter(
                Requirement.project_id.in_(project_ids)
            )

            test_case_query = test_case_query.join(
                TestScenario,
                TestCase.scenario_id == TestScenario.id,
            ).join(
                Requirement,
                TestScenario.requirement_id == Requirement.id,
            ).filter(
                Requirement.project_id.in_(project_ids)
            )

            suite_query = suite_query.filter(
                TestSuite.project_id.in_(project_ids)
            )

            run_query = run_query.filter(
                TestSuite.project_id.in_(project_ids)
            )

            execution_query = execution_query.filter(
                TestSuite.project_id.in_(project_ids)
            )

            bug_query = bug_query.filter(
                TestSuite.project_id.in_(project_ids)
            )

        return {
            "requirements": requirement_query.count(),
            "scenarios": scenario_query.count(),
            "test_cases": test_case_query.count(),
            "test_suites": suite_query.count(),
            "test_runs": run_query.count(),
            "executions": execution_query.count(),
            "bugs": bug_query.count(),
        }

    # ============================================================
    # Execution analytics
    # ============================================================

    def _execution_query(
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

        return self._apply_project_filter(
            query,
            project_ids,
            TestSuite.project_id,
        )

    def _execution_health(
        self,
        project_ids: list[int] | None = None,
    ):
        query = self._execution_query(project_ids)

        total = query.count()

        passed = query.filter(
            TestExecution.status == "Passed"
        ).count()

        failed = query.filter(
            TestExecution.status == "Failed"
        ).count()

        blocked = query.filter(
            TestExecution.status == "Blocked"
        ).count()

        not_executed = query.filter(
            TestExecution.status == "Not Executed"
        ).count()

        executed = passed + failed + blocked

        return {
            "total": total,
            "executed": executed,
            "passed": passed,
            "failed": failed,
            "blocked": blocked,
            "not_executed": not_executed,
            "pass_rate": self._percentage(
                passed,
                executed,
            ),
            "execution_progress": self._percentage(
                executed,
                total,
            ),
        }

    def get_execution_analytics(
        self,
        project_ids: list[int] | None = None,
    ):
        health = self._execution_health(project_ids)

        query = self._execution_query(project_ids)

        statuses = (
            query.with_entities(
                TestExecution.status,
                func.count(TestExecution.id),
            )
            .group_by(TestExecution.status)
            .all()
        )

        status_distribution = [
            {
                "status": status,
                "count": count,
            }
            for status, count in statuses
        ]

        execution_types = (
            query.with_entities(
                TestRun.execution_type,
                TestExecution.status,
                func.count(TestExecution.id),
            )
            .group_by(
                TestRun.execution_type,
                TestExecution.status,
            )
            .all()
        )

        type_data = defaultdict(
            lambda: {
                "executions": 0,
                "passed": 0,
                "failed": 0,
                "blocked": 0,
            }
        )

        for execution_type, status, count in execution_types:
            if not execution_type:
                execution_type = "Unknown"

            type_data[execution_type]["executions"] += count

            if status == "Passed":
                type_data[execution_type]["passed"] += count
            elif status == "Failed":
                type_data[execution_type]["failed"] += count
            elif status == "Blocked":
                type_data[execution_type]["blocked"] += count

        execution_type_data = []

        for execution_type, values in sorted(
            type_data.items()
        ):
            executed = (
                values["passed"]
                + values["failed"]
                + values["blocked"]
            )

            execution_type_data.append(
                {
                    "execution_type": execution_type,
                    "executions": values["executions"],
                    "passed": values["passed"],
                    "failed": values["failed"],
                    "blocked": values["blocked"],
                    "pass_rate": self._percentage(
                        values["passed"],
                        executed,
                    ),
                }
            )

        trend_rows = (
            query
            .filter(
                TestExecution.executed_at.isnot(None)
            )
            .with_entities(
                func.date(TestExecution.executed_at),
                TestExecution.status,
                func.count(TestExecution.id),
            )
            .group_by(
                func.date(TestExecution.executed_at),
                TestExecution.status,
            )
            .order_by(
                func.date(TestExecution.executed_at)
            )
            .all()
        )

        trend_data = defaultdict(
            lambda: {
                "executed": 0,
                "passed": 0,
                "failed": 0,
                "blocked": 0,
            }
        )

        for trend_date, status, count in trend_rows:
            trend_date = self._format_date(trend_date)

            if status in {
                "Passed",
                "Failed",
                "Blocked",
            }:
                trend_data[trend_date]["executed"] += count

            if status == "Passed":
                trend_data[trend_date]["passed"] += count
            elif status == "Failed":
                trend_data[trend_date]["failed"] += count
            elif status == "Blocked":
                trend_data[trend_date]["blocked"] += count

        trend = [
            {
                "date": trend_date,
                **values,
            }
            for trend_date, values in sorted(
                trend_data.items()
            )
        ]

        environment_rows = (
            query
            .with_entities(
                TestRun.environment,
                TestExecution.status,
                func.count(TestExecution.id),
            )
            .group_by(
                TestRun.environment,
                TestExecution.status,
            )
            .all()
        )

        environment_data = defaultdict(
            lambda: {
                "executions": 0,
                "passed": 0,
                "failed": 0,
                "blocked": 0,
            }
        )

        for environment, status, count in environment_rows:
            environment = (
                environment
                if environment
                else "Unspecified"
            )

            environment_data[environment][
                "executions"
            ] += count

            if status == "Passed":
                environment_data[environment]["passed"] += count
            elif status == "Failed":
                environment_data[environment]["failed"] += count
            elif status == "Blocked":
                environment_data[environment]["blocked"] += count

        environment_distribution = []

        for environment, values in sorted(
            environment_data.items()
        ):
            executed = (
                values["passed"]
                + values["failed"]
                + values["blocked"]
            )

            environment_distribution.append(
                {
                    "environment": environment,
                    "executions": values["executions"],
                    "passed": values["passed"],
                    "failed": values["failed"],
                    "blocked": values["blocked"],
                    "pass_rate": self._percentage(
                        values["passed"],
                        executed,
                    ),
                }
            )

        return {
            "summary": health,
            "status_distribution": status_distribution,
            "execution_type": execution_type_data,
            "trend": trend,
            "environment_distribution": environment_distribution,
        }

    # ============================================================
    # Coverage analytics
    # ============================================================

    def get_coverage_analytics(
        self,
        project_ids: list[int] | None = None,
    ):
        requirement_query = self.db.query(
            Requirement
        )

        if project_ids is not None:
            requirement_query = requirement_query.filter(
                Requirement.project_id.in_(project_ids)
            )

        requirements = requirement_query.all()

        scenario_query = self.db.query(
            TestScenario
        ).join(
            Requirement,
            TestScenario.requirement_id == Requirement.id,
        )

        if project_ids is not None:
            scenario_query = scenario_query.filter(
                Requirement.project_id.in_(project_ids)
            )

        scenarios = scenario_query.all()

        test_case_query = self.db.query(
            TestCase
        ).join(
            TestScenario,
            TestCase.scenario_id == TestScenario.id,
        ).join(
            Requirement,
            TestScenario.requirement_id == Requirement.id,
        )

        if project_ids is not None:
            test_case_query = test_case_query.filter(
                Requirement.project_id.in_(project_ids)
            )

        test_cases = test_case_query.all()

        test_case_ids = {
            test_case.id
            for test_case in test_cases
        }

        executed_test_case_ids = set()

        if test_case_ids:
            execution_query = self._execution_query(
                project_ids
            )

            execution_rows = (
                execution_query
                .filter(
                    TestExecution.test_case_id.in_(
                        test_case_ids
                    )
                )
                .with_entities(
                    TestExecution.test_case_id
                )
                .distinct()
                .all()
            )

            executed_test_case_ids = {
                row[0]
                for row in execution_rows
            }

        requirements_with_scenarios = 0
        requirements_with_test_cases = 0

        requirement_rows = []

        module_data = defaultdict(
            lambda: {
                "requirements": 0,
                "scenarios": 0,
                "test_cases": 0,
                "executed_test_cases": set(),
            }
        )

        scenario_ids_by_requirement = defaultdict(set)
        test_case_ids_by_requirement = defaultdict(set)

        for scenario in scenarios:
            scenario_ids_by_requirement[
                scenario.requirement_id
            ].add(scenario.id)

        for test_case in test_cases:
            test_case_ids_by_requirement[
                test_case.scenario.requirement_id
            ].add(test_case.id)

        for requirement in requirements:
            scenario_ids = scenario_ids_by_requirement[
                requirement.id
            ]

            requirement_test_case_ids = (
                test_case_ids_by_requirement[
                    requirement.id
                ]
            )

            scenario_count = len(scenario_ids)
            test_case_count = len(
                requirement_test_case_ids
            )

            if scenario_count > 0:
                requirements_with_scenarios += 1

            if test_case_count > 0:
                requirements_with_test_cases += 1

            executed_count = len(
                requirement_test_case_ids
                & executed_test_case_ids
            )

            module = requirement.module or "Unspecified"

            module_data[module]["requirements"] += 1
            module_data[module]["scenarios"] += scenario_count
            module_data[module]["test_cases"] += test_case_count
            module_data[module][
                "executed_test_cases"
            ].update(
                requirement_test_case_ids
                & executed_test_case_ids
            )

            requirement_rows.append(
                {
                    "requirement_code": requirement.requirement_code,
                    "module": module,
                    "priority": requirement.priority,
                    "scenario_count": scenario_count,
                    "test_case_count": test_case_count,
                    "executed_test_case_count": executed_count,
                    "coverage": self._percentage(
                        executed_count,
                        test_case_count,
                    ),
                }
            )

        scenarios_with_test_cases = 0

        test_cases_by_scenario = defaultdict(int)

        for test_case in test_cases:
            test_cases_by_scenario[
                test_case.scenario_id
            ] += 1

        for scenario in scenarios:
            if test_cases_by_scenario[
                scenario.id
            ] > 0:
                scenarios_with_test_cases += 1

        total_requirements = len(requirements)
        total_scenarios = len(scenarios)
        total_test_cases = len(test_cases)
        executed_test_cases = len(
            executed_test_case_ids
        )

        module_distribution = []

        for module, values in sorted(
            module_data.items()
        ):
            module_distribution.append(
                {
                    "module": module,
                    "requirements": values["requirements"],
                    "scenarios": values["scenarios"],
                    "test_cases": values["test_cases"],
                    "executed_test_cases": len(
                        values["executed_test_cases"]
                    ),
                    "coverage": self._percentage(
                        len(
                            values[
                                "executed_test_cases"
                            ]
                        ),
                        values["test_cases"],
                    ),
                }
            )

        gaps = []

        for requirement in requirements:
            scenario_count = len(
                scenario_ids_by_requirement[
                    requirement.id
                ]
            )

            test_case_count = len(
                test_case_ids_by_requirement[
                    requirement.id
                ]
            )

            if scenario_count == 0:
                gap_type = "NO_SCENARIOS"
            elif test_case_count == 0:
                gap_type = "NO_TEST_CASES"
            else:
                continue

            gaps.append(
                {
                    "requirement_code": requirement.requirement_code,
                    "module": requirement.module or "Unspecified",
                    "priority": requirement.priority,
                    "gap_type": gap_type,
                }
            )

        return {
            "summary": {
                "requirements": total_requirements,
                "requirements_with_scenarios": (
                    requirements_with_scenarios
                ),
                "requirements_without_scenarios": (
                    total_requirements
                    - requirements_with_scenarios
                ),
                "requirements_with_test_cases": (
                    requirements_with_test_cases
                ),
                "requirements_without_test_cases": (
                    total_requirements
                    - requirements_with_test_cases
                ),
                "scenarios": total_scenarios,
                "scenarios_with_test_cases": (
                    scenarios_with_test_cases
                ),
                "scenarios_without_test_cases": (
                    total_scenarios
                    - scenarios_with_test_cases
                ),
                "test_cases": total_test_cases,
                "test_cases_executed": (
                    executed_test_cases
                ),
                "test_cases_not_executed": (
                    total_test_cases
                    - executed_test_cases
                ),
                "requirement_coverage": self._percentage(
                    requirements_with_test_cases,
                    total_requirements,
                ),
                "scenario_coverage": self._percentage(
                    scenarios_with_test_cases,
                    total_scenarios,
                ),
                "execution_coverage": self._percentage(
                    executed_test_cases,
                    total_test_cases,
                ),
            },
            "module_distribution": module_distribution,
            "requirements": requirement_rows,
            "gaps": gaps,
        }

    # ============================================================
    # Defect analytics
    # ============================================================

    def _bug_query(
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

        return self._apply_project_filter(
            query,
            project_ids,
            TestSuite.project_id,
        )

    def get_defect_analytics(
        self,
        project_ids: list[int] | None = None,
    ):
        query = self._bug_query(project_ids)

        total = query.count()

        status_values = [
            "Open",
            "In Progress",
            "Fixed",
            "Ready for QA",
            "Retesting",
            "Closed",
            "Reopened",
        ]

        status_counts = {}

        for status in status_values:
            status_counts[status] = query.filter(
                Bug.status == status
            ).count()

        severity_values = [
            "Critical",
            "High",
            "Medium",
            "Low",
        ]

        severity_counts = {}

        for severity in severity_values:
            severity_counts[severity] = query.filter(
                Bug.severity == severity
            ).count()

        critical_open = query.filter(
            Bug.severity == "Critical",
            Bug.status != "Closed",
        ).count()

        high_open = query.filter(
            Bug.severity == "High",
            Bug.status != "Closed",
        ).count()

        status_distribution = [
            {
                "name": status,
                "count": status_counts[status],
            }
            for status in status_values
        ]

        severity_distribution = [
            {
                "name": severity,
                "count": severity_counts[severity],
            }
            for severity in severity_values
        ]

        priority_rows = (
            query.with_entities(
                Bug.priority,
                func.count(Bug.id),
            )
            .group_by(Bug.priority)
            .order_by(Bug.priority)
            .all()
        )

        priority_distribution = [
            {
                "name": priority or "Unspecified",
                "count": count,
            }
            for priority, count in priority_rows
        ]

        module_rows = (
            query.with_entities(
                TestCase.module,
                func.count(Bug.id),
            )
            .join(
                TestCase,
                TestExecution.test_case_id
                == TestCase.id,
            )
            .group_by(TestCase.module)
            .order_by(TestCase.module)
            .all()
        )

        module_distribution = [
            {
                "name": module or "Unspecified",
                "count": count,
            }
            for module, count in module_rows
        ]

        environment_rows = (
            query.with_entities(
                TestRun.environment,
                func.count(Bug.id),
            )
            .group_by(TestRun.environment)
            .order_by(TestRun.environment)
            .all()
        )

        environment_distribution = [
            {
                "name": environment or "Unspecified",
                "count": count,
            }
            for environment, count in environment_rows
        ]

        trend_rows = (
            query
            .with_entities(
                func.date(Bug.created_at),
                func.count(Bug.id),
            )
            .group_by(
                func.date(Bug.created_at)
            )
            .order_by(
                func.date(Bug.created_at)
            )
            .all()
        )

        closed_rows = (
            query
            .filter(Bug.status == "Closed")
            .with_entities(
                func.date(Bug.updated_at),
                func.count(Bug.id),
            )
            .group_by(
                func.date(Bug.updated_at)
            )
            .all()
        )

        closed_by_date = {
            self._format_date(
                trend_date
            ): count
            for trend_date, count in closed_rows
        }

        trend = []

        for trend_date, opened_count in trend_rows:
            formatted_date = self._format_date(
                trend_date
            )

            trend.append(
                {
                    "date": formatted_date,
                    "total": opened_count,
                    "opened": opened_count,
                    "closed": closed_by_date.get(
                        formatted_date,
                        0,
                    ),
                }
            )

        return {
            "summary": {
                "total": total,
                "open": status_counts["Open"],
                "in_progress": status_counts[
                    "In Progress"
                ],
                "fixed": status_counts["Fixed"],
                "ready_for_qa": status_counts[
                    "Ready for QA"
                ],
                "retesting": status_counts[
                    "Retesting"
                ],
                "closed": status_counts["Closed"],
                "reopened": status_counts[
                    "Reopened"
                ],
                "critical": severity_counts[
                    "Critical"
                ],
                "high": severity_counts["High"],
                "medium": severity_counts["Medium"],
                "low": severity_counts["Low"],
                "critical_open": critical_open,
                "high_open": high_open,
            },
            "status_distribution": status_distribution,
            "severity_distribution": severity_distribution,
            "priority_distribution": priority_distribution,
            "module_distribution": module_distribution,
            "environment_distribution": environment_distribution,
            "trend": trend,
        }

    # ============================================================
    # Risk analytics
    # ============================================================

    def get_quality_risk(
        self,
        project_ids: list[int] | None = None,
    ):
        risks = []

        coverage = self.get_coverage_analytics(
            project_ids
        )

        for gap in coverage["gaps"]:
            level = (
                "HIGH"
                if gap["priority"] in {
                    "Critical",
                    "High",
                }
                else "MEDIUM"
            )

            risks.append(
                {
                    "level": level,
                    "category": "COVERAGE_GAP",
                    "title": (
                        "High-priority requirement "
                        "without test coverage"
                        if level == "HIGH"
                        else "Requirement has a "
                        "coverage gap"
                    ),
                    "module": gap["module"],
                    "reference_code": (
                        gap["requirement_code"]
                    ),
                    "description": (
                        "Requirement has no associated "
                        "scenarios or test cases."
                        if gap["gap_type"]
                        == "NO_SCENARIOS"
                        else
                        "Requirement has scenarios but "
                        "no associated test cases."
                    ),
                }
            )

        bug_query = self._bug_query(
            project_ids
        )

        critical_bugs = (
            bug_query
            .filter(
                Bug.severity == "Critical",
                Bug.status != "Closed",
            )
            .all()
        )

        for bug in critical_bugs:
            module = (
                bug.execution.test_case.module
                if bug.execution
                and bug.execution.test_case
                else None
            )

            risks.append(
                {
                    "level": "HIGH",
                    "category": "OPEN_DEFECT",
                    "title": "Critical defect remains open",
                    "module": module,
                    "reference_code": bug.bug_code,
                    "description": (
                        f"{bug.bug_code} is a Critical "
                        "severity defect that is not closed."
                    ),
                }
            )

        high_bugs = (
            bug_query
            .filter(
                Bug.severity == "High",
                Bug.status != "Closed",
            )
            .all()
        )

        for bug in high_bugs:
            module = (
                bug.execution.test_case.module
                if bug.execution
                and bug.execution.test_case
                else None
            )

            risks.append(
                {
                    "level": "HIGH",
                    "category": "OPEN_DEFECT",
                    "title": "High-severity defect remains open",
                    "module": module,
                    "reference_code": bug.bug_code,
                    "description": (
                        f"{bug.bug_code} is a High severity "
                        "defect that is not closed."
                    ),
                }
            )

        failed_query = (
            self._execution_query(project_ids)
            .filter(
                TestExecution.status == "Failed"
            )
            .join(
                TestCase,
                TestExecution.test_case_id
                == TestCase.id,
            )
        )

        failed_modules = (
            failed_query
            .with_entities(
                TestCase.module,
                func.count(TestExecution.id),
            )
            .group_by(TestCase.module)
            .order_by(
                func.count(TestExecution.id).desc()
            )
            .all()
        )

        for module, count in failed_modules:
            if count < 2:
                continue

            risks.append(
                {
                    "level": (
                        "HIGH"
                        if count >= 5
                        else "MEDIUM"
                    ),
                    "category": "FAILED_EXECUTION",
                    "title": "Failure concentration detected",
                    "module": (
                        module
                        if module
                        else "Unspecified"
                    ),
                    "reference_code": None,
                    "description": (
                        f"{count} failed executions "
                        "are associated with this module."
                    ),
                }
            )

        high_risk_count = sum(
            1
            for risk in risks
            if risk["level"] == "HIGH"
        )

        medium_risk_count = sum(
            1
            for risk in risks
            if risk["level"] == "MEDIUM"
        )

        low_risk_count = sum(
            1
            for risk in risks
            if risk["level"] == "LOW"
        )

        return {
            "summary": {
                "high": high_risk_count,
                "medium": medium_risk_count,
                "low": low_risk_count,
            },
            "risks": risks,
        }

    # ============================================================
    # Traceability analytics
    # ============================================================

    def get_traceability_analytics(
        self,
        project_ids: list[int] | None = None,
    ):
        latest_execution_subquery = (
            self.db.query(
                TestExecution.test_case_id,
                func.max(TestExecution.id).label(
                    "latest_execution_id"
                ),
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
            latest_execution_subquery = (
                latest_execution_subquery.filter(
                    TestSuite.project_id.in_(
                        project_ids
                    )
                )
            )

        latest_execution_subquery = (
            latest_execution_subquery
            .group_by(
                TestExecution.test_case_id
            )
            .subquery()
        )

        traceability_query = (
            self.db.query(
                Requirement,
                TestScenario,
                TestCase,
                TestExecution,
                TestRun,
                Bug,
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
            .outerjoin(
                latest_execution_subquery,
                latest_execution_subquery.c.test_case_id
                == TestCase.id,
            )
            .outerjoin(
                TestExecution,
                TestExecution.id
                == latest_execution_subquery.c.latest_execution_id,
            )
            .outerjoin(
                TestRun,
                TestExecution.run_id
                == TestRun.id,
            )
            .outerjoin(
                Bug,
                Bug.execution_id
                == TestExecution.id,
            )
        )

        if project_ids is not None:
            traceability_query = (
                traceability_query.filter(
                    Requirement.project_id.in_(
                        project_ids
                    )
                )
            )

        rows = traceability_query.all()

        items = []

        executed_test_cases = set()
        failed_test_cases = set()
        linked_bugs = set()

        for (
            requirement,
            scenario,
            test_case,
            execution,
            run,
            bug,
        ) in rows:
            if execution:
                executed_test_cases.add(
                    test_case.id
                )

                if execution.status == "Failed":
                    failed_test_cases.add(
                        test_case.id
                    )

            if bug:
                linked_bugs.add(
                    bug.id
                )

            if not execution:
                risk_level = "MEDIUM"
            elif execution.status == "Failed":
                risk_level = "HIGH"
            elif bug and bug.status != "Closed":
                risk_level = "HIGH"
            else:
                risk_level = "LOW"

            items.append(
                {
                    "requirement_code": (
                        requirement.requirement_code
                    ),
                    "scenario_code": (
                        scenario.scenario_code
                    ),
                    "test_case_code": (
                        test_case.test_case_code
                    ),
                    "module": (
                        test_case.module
                        or requirement.module
                        or "Unspecified"
                    ),
                    "priority": test_case.priority,
                    "execution_status": (
                        execution.status
                        if execution
                        else None
                    ),
                    "execution_id": (
                        execution.id
                        if execution
                        else None
                    ),
                    "run_code": (
                        run.run_code
                        if run
                        else None
                    ),
                    "bug_code": (
                        bug.bug_code
                        if bug
                        else None
                    ),
                    "risk_level": risk_level,
                }
            )

        total_requirements = (
            self.db.query(Requirement)
        )

        total_scenarios = (
            self.db.query(TestScenario)
            .join(
                Requirement,
                TestScenario.requirement_id
                == Requirement.id,
            )
        )

        total_test_cases = (
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
        )

        if project_ids is not None:
            total_requirements = (
                total_requirements.filter(
                    Requirement.project_id.in_(
                        project_ids
                    )
                )
            )

            total_scenarios = (
                total_scenarios.filter(
                    Requirement.project_id.in_(
                        project_ids
                    )
                )
            )

            total_test_cases = (
                total_test_cases.filter(
                    Requirement.project_id.in_(
                        project_ids
                    )
                )
            )

        traceability_gaps = sum(
            1
            for item in items
            if item["execution_status"] is None
        )

        return {
            "summary": {
                "requirements": total_requirements.count(),
                "scenarios": total_scenarios.count(),
                "test_cases": total_test_cases.count(),
                "executed_test_cases": len(
                    executed_test_cases
                ),
                "failed_test_cases": len(
                    failed_test_cases
                ),
                "linked_bugs": len(
                    linked_bugs
                ),
                "traceability_gaps": traceability_gaps,
            },
            "items": items,
        }
    # ============================================================
    # Helpers
    # ============================================================

    @staticmethod
    def _format_date(
        value,
    ) -> str:
        if value is None:
            return ""

        if isinstance(value, date):
            return value.isoformat()

        return str(value)