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

  assigned_to: string | null;
  reported_by: string | null;
  environment: string | null;

  steps_to_reproduce: string | null;
  actual_result: string | null;
}