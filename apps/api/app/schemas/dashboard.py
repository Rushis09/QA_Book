from pydantic import BaseModel


class ExecutionHealth(BaseModel):
    total: int
    passed: int
    failed: int
    blocked: int
    not_executed: int

    executed: int
    execution_percentage: float
    pass_percentage: float


class DefectHealth(BaseModel):
    total: int
    open: int
    in_progress: int
    fixed: int
    closed: int
    reopened: int


class RequirementHealth(BaseModel):
    total: int
    covered: int
    coverage_percentage: float


class AutomationHealth(BaseModel):
    automation_projects: int
    mapped_test_cases: int
    github_connections: int


class DashboardSummary(BaseModel):
    projects: int
    requirements: int
    test_scenarios: int
    test_cases: int
    test_suites: int
    test_runs: int
    test_executions: int
    bugs: int
    overall_pass_rate: float

    execution_health: ExecutionHealth
    defect_health: DefectHealth
    requirement_health: RequirementHealth
    automation_health: AutomationHealth