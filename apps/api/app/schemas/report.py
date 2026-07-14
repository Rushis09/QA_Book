from pydantic import BaseModel


class ExecutionSummary(BaseModel):
    total: int
    passed: int
    failed: int
    blocked: int
    not_executed: int
    pass_percentage: float


class BugSummary(BaseModel):
    total: int
    open: int
    in_progress: int
    fixed: int
    closed: int
    reopened: int

class RequirementCoverage(BaseModel):
    requirement_id: int
    requirement_code: str
    module: str
    scenario_count: int
    test_case_count: int
    coverage_percentage: float


class RequirementCoverageResponse(BaseModel):
    coverage: list[RequirementCoverage]

class TraceabilityItem(BaseModel):
    requirement_code: str
    scenario_code: str
    test_case_code: str
    execution_status: str | None
    bug_code: str | None


class TraceabilityResponse(BaseModel):
    traceability: list[TraceabilityItem]


class ReportSummary(BaseModel):
    execution_summary: ExecutionSummary
    bug_summary: BugSummary