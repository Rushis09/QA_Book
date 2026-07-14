export interface ExecutionSummary {
  total: number;
  passed: number;
  failed: number;
  blocked: number;
  not_executed: number;
  pass_percentage: number;
}

export interface BugSummary {
  total: number;
  open: number;
  in_progress: number;
  fixed: number;
  closed: number;
  reopened: number;
}

export interface ReportSummary {
  execution_summary: ExecutionSummary;
  bug_summary: BugSummary;
}

export interface RequirementCoverage {
  requirement_id: number;
  requirement_code: string;
  module: string;
  scenario_count: number;
  test_case_count: number;
  coverage_percentage: number;
}

export interface RequirementCoverageResponse {
  coverage: RequirementCoverage[];
}

export interface TraceabilityItem {
  requirement_code: string;
  scenario_code: string;
  test_case_code: string;
  execution_status: string | null;
  bug_code: string | null;
}

export interface TraceabilityResponse {
  traceability: TraceabilityItem[];
}