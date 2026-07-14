from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session,selectinload

from app.exports.project_exporter import ProjectExporter
from app.db.session import get_db
from app.exports.constants import ExportConstants
from app.exports.requirement_exporter import RequirementExporter
from app.models.project import Project
from app.models.requirement import Requirement
from app.exports.scenario_exporter import ScenarioExporter
from app.models.test_scenario import TestScenario
from app.exports.test_case_exporter import TestCaseExporter
from app.models.test_case import TestCase
from app.exports.test_suite_exporter import TestSuiteExporter
from app.models.test_suite import TestSuite
from app.exports.test_run_exporter import TestRunExporter
from app.models.test_run import TestRun
from app.exports.bug_exporter import BugExporter
from app.models.bug import Bug
from app.models.test_execution import TestExecution

router = APIRouter(
    prefix="/exports",
    tags=["Exports"],
)

@router.get("/project/{project_id}")
def export_project(
    project_id: int,
    db: Session = Depends(get_db),
):
    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    metadata = {
        ExportConstants.PROJECT_NAME_LABEL: project.name,
        ExportConstants.PROJECT_CODE_LABEL: project.project_code,
        ExportConstants.GENERATED_BY_LABEL: "QABook",
        ExportConstants.GENERATED_DATE_LABEL: datetime.now().strftime(
            "%d-%b-%Y %H:%M"
        ),
        ExportConstants.VERSION_LABEL: ExportConstants.QDS_VERSION,
    }
    
    exporter = ProjectExporter()
    
    excel_file = exporter.generate(
        metadata=metadata,
        project={
            "project_code": project.project_code,
            "name": project.name,
            "status": project.status,
            "version": project.version,
            "start_date": (
                str(project.start_date)
                if project.start_date
                else ""
            ),
            "end_date": (
                str(project.end_date)
                if project.end_date
                else ""
            ),
            "description": project.description,
        },
    )

    filename = (
        f"{project.project_code}_ProjectSummary.xlsx"
    )

    return StreamingResponse(
        excel_file,
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),
        headers={
            "Content-Disposition": (
                f'attachment; filename="{filename}"'
            )
        },
    )

@router.get("/requirements/{project_id}")
def export_requirements(
    project_id: int,
    db: Session = Depends(get_db),
):
    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    requirements = (
        db.query(Requirement)
        .filter(Requirement.project_id == project_id)
        .order_by(Requirement.requirement_code)
        .all()
    )
    
    metadata = {
        ExportConstants.PROJECT_NAME_LABEL: project.name,
        ExportConstants.PROJECT_CODE_LABEL: project.project_code,
        ExportConstants.GENERATED_BY_LABEL: "QABook",
        ExportConstants.GENERATED_DATE_LABEL: datetime.now().strftime(
            "%d-%b-%Y %H:%M"
        ),
        ExportConstants.VERSION_LABEL: ExportConstants.QDS_VERSION,
    }

    exporter = RequirementExporter()

    excel_file = exporter.generate(
        metadata=metadata,
        requirements=[
            {
                "requirement_code": requirement.requirement_code,
                "module": requirement.module,
                "priority": requirement.priority,
                "status": requirement.status,
                "description": requirement.description,
            }
            for requirement in requirements
        ],
    )

    filename = (
        f"{project.project_code}_Requirements.xlsx"
    )

    return StreamingResponse(
        excel_file,
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),
        headers={
            "Content-Disposition": (
                f'attachment; filename="{filename}"'
            )
        },
    )

@router.get("/scenarios/{project_id}")
def export_test_scenarios(
    project_id: int,
    db: Session = Depends(get_db),
):
    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    scenarios = (
        db.query(TestScenario)
        .options(selectinload(TestScenario.requirement))
        .join(Requirement)
        .filter(Requirement.project_id == project_id)
        .order_by(TestScenario.scenario_code)
        .all()
    )

    metadata = {
        ExportConstants.PROJECT_NAME_LABEL: project.name,
        ExportConstants.PROJECT_CODE_LABEL: project.project_code,
        ExportConstants.GENERATED_BY_LABEL: "QABook",
        ExportConstants.GENERATED_DATE_LABEL: datetime.now().strftime(
            "%d-%b-%Y %H:%M"
        ),
        ExportConstants.VERSION_LABEL: ExportConstants.QDS_VERSION,
    }

    exporter = ScenarioExporter()

    excel_file = exporter.generate(
        metadata=metadata,
        scenarios=[
            {
                "scenario_code": scenario.scenario_code,
                "requirement_code": scenario.requirement.requirement_code,
                "module": scenario.requirement.module,
                "title": scenario.title,
                "description": scenario.description,
            }
            for scenario in scenarios
        ],
    )

    filename = (
        f"{project.project_code}_TestScenarios.xlsx"
    )

    return StreamingResponse(
        excel_file,
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),
        headers={
            "Content-Disposition": (
                f'attachment; filename="{filename}"'
            )
        },
    )

@router.get("/test-cases/{project_id}")
def export_test_cases(
    project_id: int,
    db: Session = Depends(get_db),
):
    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    test_cases = (
        db.query(TestCase)
        .options(
            selectinload(TestCase.scenario)
            .selectinload(TestScenario.requirement)
        )
        .join(TestScenario)
        .join(Requirement)
        .filter(Requirement.project_id == project_id)
        .order_by(TestCase.test_case_code)
        .all()
    )

    metadata = {
        ExportConstants.PROJECT_NAME_LABEL: project.name,
        ExportConstants.PROJECT_CODE_LABEL: project.project_code,
        ExportConstants.GENERATED_BY_LABEL: "QABook",
        ExportConstants.GENERATED_DATE_LABEL: datetime.now().strftime(
            "%d-%b-%Y %H:%M"
        ),
        ExportConstants.VERSION_LABEL: ExportConstants.QDS_VERSION,
    }

    exporter = TestCaseExporter()

    excel_file = exporter.generate(
        metadata=metadata,
        test_cases=[
            {
                "test_case_code": test_case.test_case_code,
                "requirement_code": (
                    test_case.scenario.requirement.requirement_code
                ),
                "scenario_code": (
                    test_case.scenario.scenario_code
                ),
                "component": test_case.component,
                "priority": test_case.priority,
                "title": test_case.title,
                "preconditions": test_case.preconditions,
                "test_data": test_case.test_data,
                "steps": test_case.steps,
                "expected_result": test_case.expected_result,
            }
            for test_case in test_cases
        ],
    )

    filename = (
        f"{project.project_code}_TestCases.xlsx"
    )

    return StreamingResponse(
        excel_file,
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),
        headers={
            "Content-Disposition": (
                f'attachment; filename="{filename}"'
            )
        },
    )

@router.get("/test-suites/{project_id}")
def export_test_suites(
    project_id: int,
    db: Session = Depends(get_db),
):
    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    test_suites = (
        db.query(TestSuite)
        .options(
            selectinload(TestSuite.test_cases)
        )
        .filter(TestSuite.project_id == project_id)
        .order_by(TestSuite.suite_code)
        .all()
    )

    metadata = {
        ExportConstants.PROJECT_NAME_LABEL: project.name,
        ExportConstants.PROJECT_CODE_LABEL: project.project_code,
        ExportConstants.GENERATED_BY_LABEL: "QABook",
        ExportConstants.GENERATED_DATE_LABEL: datetime.now().strftime(
            "%d-%b-%Y %H:%M"
        ),
        ExportConstants.VERSION_LABEL: ExportConstants.QDS_VERSION,
    }

    exporter = TestSuiteExporter()

    excel_file = exporter.generate(
        metadata=metadata,
        test_suites=[
            {
                "suite_code": suite.suite_code,
                "name": suite.name,
                "status": suite.status,
                "test_cases": [
                    {
                        "test_case_code": test_case.test_case_code,
                        "title": test_case.title,
                        "priority": test_case.priority,
                    }
                    for test_case in suite.test_cases
                ],
            }
            for suite in test_suites
        ],
    )

    filename = (
        f"{project.project_code}_TestSuites.xlsx"
    )

    return StreamingResponse(
        excel_file,
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),
        headers={
            "Content-Disposition": (
                f'attachment; filename="{filename}"'
            )
        },
    )

@router.get("/test-runs/{project_id}")
def export_test_runs(
    project_id: int,
    db: Session = Depends(get_db),
):
    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    test_runs = (
        db.query(TestRun)
        .join(TestSuite)
        .options(selectinload(TestRun.suite))
        .filter(TestSuite.project_id == project_id)
        .order_by(TestRun.run_code)
        .all()
    )

    metadata = {
        ExportConstants.PROJECT_NAME_LABEL: project.name,
        ExportConstants.PROJECT_CODE_LABEL: project.project_code,
        ExportConstants.GENERATED_BY_LABEL: "QABook",
        ExportConstants.GENERATED_DATE_LABEL: datetime.now().strftime(
            "%d-%b-%Y %H:%M"
        ),
        ExportConstants.VERSION_LABEL: ExportConstants.QDS_VERSION,
    }

    exporter = TestRunExporter()

    excel_file = exporter.generate(
        metadata=metadata,
        test_runs=[
            {
                "run_code": test_run.run_code,
                "suite_code": test_run.suite.suite_code,
                "suite_name": test_run.suite.name,
                "name": test_run.name,
                "build_version": test_run.build_version,
                "environment": test_run.environment,
                "tester": test_run.tester,
                "start_date": (
                    test_run.start_date.strftime("%d-%b-%Y %H:%M")
                    if test_run.start_date
                    else ""
                ),
                "end_date": (
                    test_run.end_date.strftime("%d-%b-%Y %H:%M")
                    if test_run.end_date
                    else ""
                ),
                "status": test_run.status,
            }
            for test_run in test_runs
        ],
    )

    filename = (
        f"{project.project_code}_TestRuns.xlsx"
    )

    return StreamingResponse(
        excel_file,
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),
        headers={
            "Content-Disposition": (
                f'attachment; filename="{filename}"'
            )
        },
    )
@router.get("/bugs/{project_id}")
def export_bugs(
    project_id: int,
    db: Session = Depends(get_db),
):
    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    bugs = (
        db.query(Bug)
        .options(
            selectinload(Bug.execution)
            .selectinload(TestExecution.test_run)
            .selectinload(TestRun.suite),
            selectinload(Bug.execution)
            .selectinload(TestExecution.test_case),
        )
        .join(TestExecution)
        .join(TestRun)
        .join(TestSuite)
        .filter(TestSuite.project_id == project_id)
        .order_by(Bug.bug_code)
        .all()
    )

    metadata = {
        ExportConstants.PROJECT_NAME_LABEL: project.name,
        ExportConstants.PROJECT_CODE_LABEL: project.project_code,
        ExportConstants.GENERATED_BY_LABEL: "QABook",
        ExportConstants.GENERATED_DATE_LABEL: datetime.now().strftime(
            "%d-%b-%Y %H:%M"
        ),
        ExportConstants.VERSION_LABEL: ExportConstants.QDS_VERSION,
    }

    exporter = BugExporter()

    excel_file = exporter.generate(
        metadata=metadata,
        bugs=[
            {
                "bug_code": bug.bug_code,
                "run_code": bug.execution.test_run.run_code,
                "test_case_code": bug.execution.test_case.test_case_code,
                "title": bug.title,
                "severity": bug.severity,
                "priority": bug.priority,
                "status": bug.status,
                "assigned_to": bug.assigned_to,
                "reported_by": bug.reported_by,
                "environment": bug.environment,
                "description": bug.description,
                "steps_to_reproduce": bug.steps_to_reproduce,
                "actual_result": bug.actual_result,
            }
            for bug in bugs
        ],
    )

    filename = (
        f"{project.project_code}_BugReport.xlsx"
    )

    return StreamingResponse(
        excel_file,
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),
        headers={
            "Content-Disposition": (
                f'attachment; filename="{filename}"'
            )
        },
    )