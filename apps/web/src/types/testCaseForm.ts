export interface TestCaseFormData {
  scenario_id: number;
  component: string;
  priority: string;
  title: string;
  description: string;
  preconditions: string;
  test_data: string;
  steps: string;
  expected_result: string;
}