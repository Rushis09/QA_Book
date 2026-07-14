export interface TestRunSuite {
  id: number;
  suite_code: string;
  name: string;
}

export interface TestRun {
  id: number;
  run_code: string;
  suite_id: number;
  suite: TestRunSuite;
  name: string;
  build_version: string | null;
  environment: string | null;
  tester: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface TestRunRequest {
  suite_id: number;
  name: string;
  build_version: string | null;
  environment: string | null;
  tester: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
}