from pydantic import BaseModel


# ============================================================
# Common
# ============================================================

class ReportProject(BaseModel):
    id: int
    project_code: str
    name: str


# ============================================================
# Overview
# ============================================================

class ReportInventory(BaseModel):
    requirements: int
    scenarios: int
    test_cases: int
    test_suites: int
    test_runs: int
    executions: int
    bugs: int


class ReportExecutionHealth(BaseModel):
    total: int
    executed: int
    passed: int
    failed: int
    blocked: int
    not_executed: int
    pass_rate: float
    execution_progress: float


class ReportCoverageHealth(BaseModel):
    requirement_coverage: float
    scenario_coverage: float
    execution_coverage: float


class ReportDefectHealth(BaseModel):
    total: int
    open: int
    in_progress: int
    fixed: int
    ready_for_qa: int
    retesting: int
    closed: int
    reopened: int
    critical_open: int
    high_open: int


class ReportOverview(BaseModel):
    project: ReportProject | None
    inventory: ReportInventory
    execution_health: ReportExecutionHealth
    coverage_health: ReportCoverageHealth
    defect_health: ReportDefectHealth


# ============================================================
# Execution Analytics
# ============================================================

class ExecutionStatusDistribution(BaseModel):
    status: str
    count: int


class ExecutionTypeAnalytics(BaseModel):
    execution_type: str
    executions: int
    passed: int
    failed: int
    blocked: int
    pass_rate: float


class ExecutionTrendItem(BaseModel):
    date: str
    executed: int
    passed: int
    failed: int
    blocked: int


class EnvironmentAnalytics(BaseModel):
    environment: str
    executions: int
    passed: int
    failed: int
    blocked: int
    pass_rate: float


class ExecutionAnalytics(BaseModel):
    summary: ReportExecutionHealth
    status_distribution: list[ExecutionStatusDistribution]
    execution_type: list[ExecutionTypeAnalytics]
    trend: list[ExecutionTrendItem]
    environment_distribution: list[EnvironmentAnalytics]


# ============================================================
# Coverage Analytics
# ============================================================

class CoverageSummary(BaseModel):
    requirements: int
    requirements_with_scenarios: int
    requirements_without_scenarios: int
    requirements_with_test_cases: int
    requirements_without_test_cases: int

    scenarios: int
    scenarios_with_test_cases: int
    scenarios_without_test_cases: int

    test_cases: int
    test_cases_executed: int
    test_cases_not_executed: int

    requirement_coverage: float
    scenario_coverage: float
    execution_coverage: float


class ModuleCoverage(BaseModel):
    module: str
    requirements: int
    scenarios: int
    test_cases: int
    executed_test_cases: int
    coverage: float


class RequirementCoverageAnalytics(BaseModel):
    requirement_code: str
    module: str
    priority: str
    scenario_count: int
    test_case_count: int
    executed_test_case_count: int
    coverage: float


class CoverageGap(BaseModel):
    requirement_code: str
    module: str
    priority: str
    gap_type: str


class CoverageAnalytics(BaseModel):
    summary: CoverageSummary
    module_distribution: list[ModuleCoverage]
    requirements: list[RequirementCoverageAnalytics]
    gaps: list[CoverageGap]


# ============================================================
# Defect Intelligence
# ============================================================

class DefectSummary(BaseModel):
    total: int
    open: int
    in_progress: int
    fixed: int
    ready_for_qa: int
    retesting: int
    closed: int
    reopened: int

    critical: int
    high: int
    medium: int
    low: int

    critical_open: int
    high_open: int


class DefectDistribution(BaseModel):
    name: str
    count: int


class DefectTrendItem(BaseModel):
    date: str
    total: int
    opened: int
    closed: int


class DefectAnalytics(BaseModel):
    summary: DefectSummary
    status_distribution: list[DefectDistribution]
    severity_distribution: list[DefectDistribution]
    priority_distribution: list[DefectDistribution]
    module_distribution: list[DefectDistribution]
    environment_distribution: list[DefectDistribution]
    trend: list[DefectTrendItem]


# ============================================================
# Quality Risk
# ============================================================

class RiskSummary(BaseModel):
    high: int
    medium: int
    low: int


class QualityRisk(BaseModel):
    level: str
    category: str
    title: str
    module: str | None
    reference_code: str | None
    description: str


class RiskAnalytics(BaseModel):
    summary: RiskSummary
    risks: list[QualityRisk]


# ============================================================
# Traceability
# ============================================================

class TraceabilitySummary(BaseModel):
    requirements: int
    scenarios: int
    test_cases: int
    executed_test_cases: int
    failed_test_cases: int
    linked_bugs: int
    traceability_gaps: int


class TraceabilityAnalyticsItem(BaseModel):
    requirement_code: str
    scenario_code: str
    test_case_code: str
    module: str
    priority: str

    execution_status: str | None
    execution_id: int | None
    run_code: str | None

    bug_code: str | None
    risk_level: str


class TraceabilityAnalytics(BaseModel):
    summary: TraceabilitySummary
    items: list[TraceabilityAnalyticsItem]