import type {
  ExecutionMethod,
  TestingType,
} from "./testCase";

export interface TestCaseFormData {
  scenario_id: number;
  module: string;
  testing_type: TestingType;
  execution_method: ExecutionMethod;
  priority: string;
  status: string;
  automation_eligibility: string;
  automation_status: string;
  title: string;
  description: string;
  preconditions: string;
  test_data: string;
  steps: string;
  expected_result: string;
  meta_attributes: Record<string, unknown>;
}
