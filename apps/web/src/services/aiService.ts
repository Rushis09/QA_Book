import api from "./api";

/* ---------- Requirements ---------- */

export interface GenerateRequirementRequest {
  project_id: number;
  manual_description: string;
  number_of_requirements: number;
}

export interface GeneratedRequirement {
  module: string;
  priority: string;
  description: string;
}

/* ---------- Scenarios ---------- */

export interface GenerateScenarioRequest {
  project_id: number;
  requirement_id?: number;
  generate_for_all: boolean;
  manual_description: string;
  number_of_scenarios: number;
}

export interface GeneratedScenario {
  title: string;
  priority: string;
  status: string;
  description: string;
}

/* ---------- Test Cases ---------- */

export interface GenerateTestCaseRequest {
  scenario_id: number;
  manual_description: string;
  number_of_test_cases: number;
}

export interface GeneratedTestCase {
  title: string;
  priority: string;
  preconditions: string;
  test_data: string;
  steps: string;
  expected_result: string;
}

export const aiService = {
  async generateRequirements(
    request: GenerateRequirementRequest,
  ): Promise<GeneratedRequirement[]> {
    const { data } =
      await api.post<GeneratedRequirement[]>(
        "/ai/requirements/generate",
        request,
      );

    return data;
  },

  async generateScenarios(
    request: GenerateScenarioRequest,
  ): Promise<GeneratedScenario[]> {
    const { data } =
      await api.post<GeneratedScenario[]>(
        "/ai/scenarios/generate",
        request,
      );

    return data;
  },

  async generateTestCases(
    request: GenerateTestCaseRequest,
  ): Promise<GeneratedTestCase[]> {
    const { data } =
      await api.post<GeneratedTestCase[]>(
        "/ai/test-cases/generate",
        request,
      );

    return data;
  },
};