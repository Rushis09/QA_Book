export interface ReportProject {
  id: number;
  project_code: string;
  name: string;
}

export interface ReportInventory {
  requirements: number;
  scenarios: number;
  test_cases: number;
  test_suites: number;
  test_runs: number;
  executions: number;
  bugs: number;
}

export interface ReportExecutionHealth {
  total: number;
  executed: number;
  passed: number;
  failed: number;
  blocked: number;
  not_executed: number;
  pass_rate: number;
  execution_progress: number;
}

export interface ReportCoverageHealth {
  requirement_coverage: number;
  scenario_coverage: number;
  execution_coverage: number;
}

export interface ReportDefectHealth {
  total: number;
  open: number;
  in_progress: number;
  fixed: number;
  ready_for_qa: number;
  retesting: number;
  closed: number;
  reopened: number;
  critical_open: number;
  high_open: number;
}

export interface ReportOverview {
  project: ReportProject | null;
  inventory: ReportInventory;
  execution_health: ReportExecutionHealth;
  coverage_health: ReportCoverageHealth;
  defect_health: ReportDefectHealth;
}

export interface ExecutionStatusDistribution {
  status: string;
  count: number;
}

export interface ExecutionTypeAnalytics {
  execution_type: string;
  executions: number;
  passed: number;
  failed: number;
  blocked: number;
  pass_rate: number;
}

export interface ExecutionTrendItem {
  date: string;
  executed: number;
  passed: number;
  failed: number;
  blocked: number;
}

export interface EnvironmentAnalytics {
  environment: string;
  executions: number;
  passed: number;
  failed: number;
  blocked: number;
  pass_rate: number;
}

export interface ExecutionAnalytics {
  summary: ReportExecutionHealth;
  status_distribution: ExecutionStatusDistribution[];
  execution_type: ExecutionTypeAnalytics[];
  trend: ExecutionTrendItem[];
  environment_distribution: EnvironmentAnalytics[];
}

export interface CoverageSummary {
  requirements: number;
  requirements_with_scenarios: number;
  requirements_without_scenarios: number;
  requirements_with_test_cases: number;
  requirements_without_test_cases: number;
  scenarios: number;
  scenarios_with_test_cases: number;
  scenarios_without_test_cases: number;
  test_cases: number;
  test_cases_executed: number;
  test_cases_not_executed: number;
  requirement_coverage: number;
  scenario_coverage: number;
  execution_coverage: number;
}

export interface ModuleCoverage {
  module: string;
  requirements: number;
  scenarios: number;
  test_cases: number;
  executed_test_cases: number;
  coverage: number;
}

export interface RequirementCoverageAnalytics {
  requirement_code: string;
  module: string;
  priority: string;
  scenario_count: number;
  test_case_count: number;
  executed_test_case_count: number;
  coverage: number;
}

export interface CoverageGap {
  requirement_code: string;
  module: string;
  priority: string;
  gap_type: string;
}

export interface CoverageAnalytics {
  summary: CoverageSummary;
  module_distribution: ModuleCoverage[];
  requirements: RequirementCoverageAnalytics[];
  gaps: CoverageGap[];
}

export interface DefectSummary {
  total: number;
  open: number;
  in_progress: number;
  fixed: number;
  ready_for_qa: number;
  retesting: number;
  closed: number;
  reopened: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  critical_open: number;
  high_open: number;
}

export interface DefectDistribution {
  name: string;
  count: number;
}

export interface DefectTrendItem {
  date: string;
  total: number;
  opened: number;
  closed: number;
}

export interface DefectAnalytics {
  summary: DefectSummary;
  status_distribution: DefectDistribution[];
  severity_distribution: DefectDistribution[];
  priority_distribution: DefectDistribution[];
  module_distribution: DefectDistribution[];
  environment_distribution: DefectDistribution[];
  trend: DefectTrendItem[];
}

export interface RiskSummary {
  high: number;
  medium: number;
  low: number;
}

export interface QualityRisk {
  level: string;
  category: string;
  title: string;
  module: string | null;
  reference_code: string | null;
  description: string;
}

export interface RiskAnalytics {
  summary: RiskSummary;
  risks: QualityRisk[];
}

export interface TraceabilitySummary {
  requirements: number;
  scenarios: number;
  test_cases: number;
  executed_test_cases: number;
  failed_test_cases: number;
  linked_bugs: number;
  traceability_gaps: number;
}

export interface TraceabilityAnalyticsItem {
  requirement_code: string;
  scenario_code: string;
  test_case_code: string;
  module: string;
  priority: string;
  execution_status: string | null;
  execution_id: number | null;
  run_code: string | null;
  bug_code: string | null;
  risk_level: string;
}

export interface TraceabilityAnalytics {
  summary: TraceabilitySummary;
  items: TraceabilityAnalyticsItem[];
}