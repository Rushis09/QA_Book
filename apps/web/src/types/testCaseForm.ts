export interface TestCaseFormData {
  scenario_id: number;

  module: string;

  priority: string;
  status: string;

  title: string;
  description: string;
  preconditions: string;
  test_data: string;
  steps: string;
  expected_result: string;
}