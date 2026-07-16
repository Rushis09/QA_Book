export interface TestCaseScenario {
  id: number;
  scenario_code: string;
  title: string;
}

export interface TestCase {
  id: number;
  test_case_code: string;

  scenario_id: number;
  scenario: TestCaseScenario;

  module: string;

  priority: string;
  status: string;

  title: string;
  description: string | null;
  preconditions: string | null;
  test_data: string | null;
  steps: string | null;
  expected_result: string | null;

  created_at: string;
  updated_at: string;
}

export interface TestCaseRequest {
  scenario_id: number;

  module: string;

  priority: string;
  status: string;

  title: string;
  description: string | null;
  preconditions: string | null;
  test_data: string | null;
  steps: string | null;
  expected_result: string | null;
}