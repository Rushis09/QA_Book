import api from "../../services/api";

import type {
  AutomationProject,
  AutomationProjectCreateRequest,
  AutomationProjectUpdateRequest,
  AutomationTestMapping,
  AutomationTestMappingCreateRequest,
  AutomationTestMappingUpdateRequest,
} from "../types/automation";

export interface AutomationRunResponse {
  automation_project_id: number;
  suite_id: number;
  suite_code: string;
  test_run_id: number;
  run_code: string;
  automation_token: string;
  test_case_ids: number[];
  execution_ids: number[];
}

export interface AutomationTestMappingBulkCreateRequest {
  automation_project_id: number;
  test_case_ids: number[];
}

const automationService = {
  getAutomationProjectByProjectId: async (
    projectId: number
  ): Promise<AutomationProject> => {
    const response = await api.get<AutomationProject>(
      `/automation-projects/project/${projectId}`
    );

    return response.data;
  },

  createAutomationProject: async (
    data: AutomationProjectCreateRequest
  ): Promise<AutomationProject> => {
    const response = await api.post<AutomationProject>(
      "/automation-projects/",
      data
    );

    return response.data;
  },

  updateAutomationProject: async (
    id: number,
    data: AutomationProjectUpdateRequest
  ): Promise<AutomationProject> => {
    const response = await api.put<AutomationProject>(
      `/automation-projects/${id}`,
      data
    );

    return response.data;
  },

  deleteAutomationProject: async (
    id: number
  ): Promise<void> => {
    await api.delete(`/automation-projects/${id}`);
  },

  getAutomationTestMappings: async (
    automationProjectId: number
  ): Promise<AutomationTestMapping[]> => {
    const response = await api.get<AutomationTestMapping[]>(
      `/automation-test-mappings/project/${automationProjectId}`
    );

    return response.data;
  },

  createAutomationTestMapping: async (
    data: AutomationTestMappingCreateRequest
  ): Promise<AutomationTestMapping> => {
    const response = await api.post<AutomationTestMapping>(
      "/automation-test-mappings/",
      data
    );

    return response.data;
  },

  bulkCreateAutomationTestMappings: async (
    data: AutomationTestMappingBulkCreateRequest
  ): Promise<AutomationTestMapping[]> => {
    const response = await api.post<AutomationTestMapping[]>(
      "/automation-test-mappings/bulk",
      data
    );

    return response.data;
  },

  updateAutomationTestMapping: async (
    id: number,
    data: AutomationTestMappingUpdateRequest
  ): Promise<AutomationTestMapping> => {
    const response = await api.put<AutomationTestMapping>(
      `/automation-test-mappings/${id}`,
      data
    );

    return response.data;
  },

  deleteAutomationTestMapping: async (
    id: number
  ): Promise<void> => {
    await api.delete(`/automation-test-mappings/${id}`);
  },

  startAutomationRun: async (
    automationProjectId: number
  ): Promise<AutomationRunResponse> => {
    const response = await api.post<AutomationRunResponse>(
      `/automation-projects/${automationProjectId}/run`
    );

    return response.data;
  },

  downloadAutomationFramework: async (
    automationProjectId: number
  ): Promise<Blob> => {
    const response = await api.get(
      `/automation-frameworks/${automationProjectId}/download`,
      {
        responseType: "blob",
      }
    );

    return response.data;
  },
};

export default automationService;