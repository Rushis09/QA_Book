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

export interface BulkScenarioGenerationRequest {
  project_id: number;
  requirement_ids: number[];
  manual_description: string;
  number_of_scenarios: number;
}

export interface BulkScenarioCandidate {
  source_requirement_id: number;
  source_requirement_code: string;
  title: string;
  priority: string;
  status: string;
  description: string;
}

export interface BulkScenarioResult {
  requirement_id: number;
  requirement_code: string;
  scenarios: BulkScenarioCandidate[];
  validation_warnings: string[];
}

export interface BulkScenarioGenerationResponse {
  project_id: number;
  requested_requirement_count: number;
  processed_requirement_count: number;
  results: BulkScenarioResult[];
  errors: string[];
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

export interface BulkTestCaseGenerationRequest {
  scenario_ids: number[];
  manual_description: string;
  number_of_test_cases: number;
}

export interface BulkTestCaseCandidate {
  source_scenario_id: number;
  source_scenario_code: string;
  title: string;
  priority: string;
  preconditions: string;
  test_data: string;
  steps: string;
  expected_result: string;
}

export interface BulkTestCaseResult {
  scenario_id: number;
  scenario_code: string;
  test_cases: BulkTestCaseCandidate[];
  validation_warnings: string[];
}

export interface BulkTestCaseGenerationResponse {
  requested_scenario_count: number;
  processed_scenario_count: number;
  results: BulkTestCaseResult[];
  errors: string[];
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

  async generateScenariosBulk(
    request: BulkScenarioGenerationRequest,
  ): Promise<BulkScenarioGenerationResponse> {
    const { data } =
      await api.post<BulkScenarioGenerationResponse>(
        "/ai/generate-scenarios-bulk",
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

  async generateTestCasesBulk(
    request: BulkTestCaseGenerationRequest,
  ): Promise<BulkTestCaseGenerationResponse> {
    const { data } =
      await api.post<BulkTestCaseGenerationResponse>(
        "/ai/generate-test-cases-bulk",
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