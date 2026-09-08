import api from "./api";

/* ---------- Requirements ---------- */

export interface GenerateRequirementRequest {
  project_id: number;
  manual_description: string;
  number_of_requirements: number;
}

export interface GenerateRequirementsFromBRDRequest {
  project_id: number;
  document_id: number;
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

/* ---------- AI Credentials ---------- */

export interface AICredentialStatusResponse {
  provider: string;
  configured: boolean;
}

export interface AICredentialSaveRequest {
  provider: string;
  api_key: string;
}

export interface AICredentialSaveResponse {
  message: string;
  provider: string;
}

export interface AICredentialTestResponse {
  provider: string;
  connected: boolean;
  message: string;
}

export const aiService = {
  /* ---------- Requirements ---------- */

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

  async generateRequirementsFromBRD(
    request: GenerateRequirementsFromBRDRequest,
  ): Promise<GeneratedRequirement[]> {
    const { data } =
      await api.post<GeneratedRequirement[]>(
        "/ai/requirements/generate-from-brd",
        request,
      );

    return data;
  },

  /* ---------- Scenarios ---------- */

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

  /* ---------- Test Cases ---------- */

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

  /* ---------- AI Credentials ---------- */

  async getCredentialStatus(): Promise<
    AICredentialStatusResponse
  > {
    const { data } =
      await api.get<AICredentialStatusResponse>(
        "/ai/credentials",
      );

    return data;
  },

  async saveCredential(
    request: AICredentialSaveRequest,
  ): Promise<AICredentialSaveResponse> {
    const { data } =
      await api.post<AICredentialSaveResponse>(
        "/ai/credentials",
        request,
      );

    return data;
  },

  async testCredential(): Promise<
    AICredentialTestResponse
  > {
    const { data } =
      await api.post<AICredentialTestResponse>(
        "/ai/credentials/test",
      );

    return data;
  },

  async deleteCredential(): Promise<void> {
    await api.delete("/ai/credentials");
  },
};