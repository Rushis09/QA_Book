export interface BugExecutionTestCase {
  id: number;
  test_case_code: string;
  title: string;
}

export interface BugExecution {
  id: number;
  status: string;
  test_case: BugExecutionTestCase;
}

export interface Bug {
  id: number;
  bug_code: string;
  execution_id: number;
  title: string;
  description: string | null;
  severity: string;
  priority: string;
  status: string;
  resolution: string | null;
  assigned_to: string | null;
  reported_by: string | null;
  environment: string | null;
  steps_to_reproduce: string | null;
  actual_result: string | null;
  execution: BugExecution;
  created_at: string;
  updated_at: string;
}

export interface BugRequest {
  execution_id: number;
  title: string;
  description: string | null;
  severity: string;
  priority: string;
  status: string;
  resolution: string | null;
  assigned_to: string | null;
  reported_by: string | null;
  environment: string | null;
  steps_to_reproduce: string | null;
  actual_result: string | null;
}

export interface BugRetestRequest {
  execution_type: "Manual" | "Automated";
}

export interface BugRetestRun {
  id: number;
  run_code: string;
  name: string;
  execution_type: "Manual" | "Automated";
  automation_token: string | null;
}

export interface BugRetestExecution {
  id: number;
  run_id: number;
  test_case_id: number;
  status: string;
  test_run: BugRetestRun;
}

export interface BugRetest {
  id: number;
  bug_id: number;
  execution_id: number;
  created_at: string;
  execution: BugRetestExecution;
}