from pydantic import BaseModel


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