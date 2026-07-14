export interface TestScenarioRequirement {
  id: number;
  requirement_code: string;
  module: string;
}

export interface TestScenario {
  id: number;
  scenario_code: string;
  title: string;
  description: string | null;
  requirement_id: number;
  requirement: TestScenarioRequirement;
  created_at: string;
  updated_at: string;
}

export interface TestScenarioRequest {
  title: string;
  description: string | null;
  requirement_id: number;
}