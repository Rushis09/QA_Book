export interface DashboardExecutionHealth {
  total: number;
  passed: number;
  failed: number;
  blocked: number;
  not_executed: number;
  executed: number;
  execution_percentage: number;
  pass_percentage: number;
}

export interface DashboardDefectHealth {
  total: number;
  open: number;
  in_progress: number;
  fixed: number;
  closed: number;
  reopened: number;
}

export interface DashboardRequirementHealth {
  total: number;
  covered: number;
  coverage_percentage: number;
}

export interface DashboardAutomationHealth {
  automation_projects: number;
  mapped_test_cases: number;
  github_connections: number;
}

export interface DashboardSummary {
  projects: number;
  requirements: number;
  test_scenarios: number;
  test_cases: number;
  test_suites: number;
  test_runs: number;
  test_executions: number;
  bugs: number;
  overall_pass_rate: number;

  execution_health: DashboardExecutionHealth;
  defect_health: DashboardDefectHealth;
  requirement_health: DashboardRequirementHealth;
  automation_health: DashboardAutomationHealth;
}