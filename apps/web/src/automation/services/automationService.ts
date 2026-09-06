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

export interface GitHubAuthorizationResponse {
  authorization_url: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  default_branch: string;
  owner: {
    login: string;
  };
}

export interface GitHubRepositoriesResponse {
  automation_project_id: number;
  github_connection_id: number;
  repositories: GitHubRepository[];
}

export interface GitHubRepositorySelectRequest {
  repository_owner: string;
  repository_name: string;
  branch: string;
}

export interface GitHubConnectionResponse {
  connected: boolean;
  github_connection_id: number | null;
  installation_id: string | null;
  repository_owner: string | null;
  repository_name: string | null;
  branch: string | null;
  repository_url: string | null;
}

export interface GitHubRepositorySelectResponse {
  message: string;
  automation_project_id: number;
  github_connection_id: number;
  installation_id: string;
  repository_owner: string;
  repository_name: string;
  branch: string;
  repository_url: string;
}

export interface GitHubFrameworkGenerationResponse {
  automation_project_id: number;
  github_connection_id: number;
  repository_owner: string;
  repository_name: string;
  branch: string;
  repository_url: string;
  repository_created: boolean;
  message: string;
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

  authorizeGitHub: async (
    automationProjectId: number
  ): Promise<GitHubAuthorizationResponse> => {
    const response = await api.get<GitHubAuthorizationResponse>(
      "/automation/github/authorize",
      {
        params: {
          automation_project_id: automationProjectId,
        },
      }
    );

    return response.data;
  },

  getGitHubRepositories: async (
    automationProjectId: number
  ): Promise<GitHubRepositoriesResponse> => {
    const response = await api.get<GitHubRepositoriesResponse>(
      "/automation/github/repositories",
      {
        params: {
          automation_project_id: automationProjectId,
        },
      }
    );

    return response.data;
  },

  getGitHubConnection: async (
    automationProjectId: number
  ): Promise<GitHubConnectionResponse> => {
    const response = await api.get<GitHubConnectionResponse>(
      "/automation/github/connection",
      {
        params: {
          automation_project_id: automationProjectId,
        },
      }
    );

    return response.data;
  },

  generateGitHubFramework: async (
    automationProjectId: number
  ): Promise<GitHubFrameworkGenerationResponse> => {
    const response =
      await api.post<GitHubFrameworkGenerationResponse>(
        "/automation/github/generate-framework",
        null,
        {
          params: {
            automation_project_id: automationProjectId,
          },
        }
      );

    return response.data;
  },

  selectGitHubRepository: async (
    automationProjectId: number,
    data: GitHubRepositorySelectRequest
  ): Promise<GitHubRepositorySelectResponse> => {
    const response = await api.put<GitHubRepositorySelectResponse>(
      "/automation/github/repository",
      data,
      {
        params: {
          automation_project_id: automationProjectId,
        },
      }
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