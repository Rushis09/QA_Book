export interface TestExecutionRun {
  id: number;
  run_code: string;
  name: string;
}

export interface TestExecutionTestCase {
  id: number;
  test_case_code: string;
  title: string;
  priority: string;
  preconditions: string | null;
  steps: string | null;
  expected_result: string | null;
}

export interface TestExecution {
  id: number;
  run_id: number;
  test_case_id: number;
  status: string;
  actual_result: string | null;
  comments: string | null;
  executed_by: string | null;
  executed_at: string | null;

  test_run: TestExecutionRun;
  test_case: TestExecutionTestCase;

  created_at: string;
  updated_at: string;
}

export interface TestExecutionSummary {
  total: number;
  passed: number;
  failed: number;
  blocked: number;
  not_executed: number;
  pass_percentage: number;
}

export interface TestExecutionUpdateRequest {
  run_id: number;
  test_case_id: number;
  status: string;
  actual_result: string | null;
  comments: string | null;
  executed_by: string | null;
  executed_at: string | null;
}

