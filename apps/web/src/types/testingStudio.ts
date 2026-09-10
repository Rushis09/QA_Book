export type TestingType =
  | "FUNCTIONAL"
  | "API"
  | "DATABASE"
  | "AUTOMATION"
  | "PERFORMANCE"
  | "SECURITY"
  | "ACCESSIBILITY";

export type ExecutionMethod =
  | "MANUAL"
  | "AUTOMATED"
  | "EXTERNAL"
  | "IMPORTED";

export interface StudioStep {
  step_no: number;
  action: string;
  test_data: string;
  expected_result: string;
}

export interface StudioScenario {
  id: number;
  scenario_code: string;
  requirement_id: number;
  module: string;
  title: string;
}

export interface TestingProfile {
  id: number;
  test_case_id: number;
  testing_type: TestingType;
  execution_method: ExecutionMethod;
  meta_attributes: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface StudioTestCase {
  id: number;
  test_case_code: string;
  scenario_id: number;
  module: string;
  priority: string;
  status: string;
  automation_eligibility: string;
  automation_status: string;
  title: string;
  description: string | null;
  preconditions: string | null;
  test_data: string | null;
  steps: string | null;
  expected_result: string | null;
  profile: TestingProfile;
  created_at: string;
  updated_at: string;
}

export interface StudioTestCaseRequest {
  scenario_id: number;
  module: string;
  priority: string;
  status: string;
  automation_eligibility: string;
  automation_status: string;
  title: string;
  description: string | null;
  preconditions: string | null;
  test_data: string | null;
  steps: string | null;
  expected_result: string | null;
  profile: {
    testing_type: TestingType;
    execution_method: ExecutionMethod;
    meta_attributes: Record<string, any>;
  };
}
