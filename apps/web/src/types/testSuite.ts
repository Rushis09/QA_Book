export interface TestSuiteProject {
  id: number;
  project_code: string;
  name: string;
}

export interface TestSuiteTestCase {
  id: number;
  test_case_code: string;
  title: string;
}

export interface TestSuite {
  id: number;
  suite_code: string;
  project_id: number;
  project: TestSuiteProject;
  test_cases: TestSuiteTestCase[];
  name: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface TestSuiteRequest {
  project_id: number;
  name: string;
  description: string | null;
  status: string;
}