export interface TestScenarioRequirement {
  id: number;
  requirement_code: string;
  module: string;
}

export interface TestScenario {
  id: number;
  scenario_code: string;

  requirement_id: number;
  module: string;

  title: string;
  description: string | null;

  priority: string;
  status: string;

  requirement: TestScenarioRequirement;

  created_at: string;
  updated_at: string;
}

export interface TestScenarioRequest {
  requirement_id: number;
  module: string;

  title: string;
  description: string | null;

  priority: string;
 status: string;
}