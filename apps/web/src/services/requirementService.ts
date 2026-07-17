import api from "./api";
import type { Requirement } from "../types/requirement";

const BASE_URL = "/requirements";

interface RequirementRequest {
  project_id: number;
  module: string;
  priority: string;
  status: string;
  description: string;
}

export const requirementService = {
  
  async getRequirements(
    projectId?: number
  ): Promise<Requirement[]> {
    const response = await api.get<Requirement[]>(
      BASE_URL,
      {
        params: projectId
          ? { project_id: projectId }
          : undefined,
      }
    );
  
    return response.data;
  },

  async getRequirement(id: number): Promise<Requirement> {
    const response = await api.get<Requirement>(`${BASE_URL}/${id}`);
    return response.data;
  },

  async createRequirement(
    data: RequirementRequest
  ): Promise<Requirement> {
    const response = await api.post<Requirement>(BASE_URL, data);
    return response.data;
  },

  async updateRequirement(
    id: number,
    data: RequirementRequest
  ): Promise<Requirement> {
    const response = await api.put<Requirement>(
      `${BASE_URL}/${id}`,
      data
    );

    return response.data;
  },

  async deleteRequirement(id: number): Promise<void> {
    await api.delete(`${BASE_URL}/${id}`);
  },
};