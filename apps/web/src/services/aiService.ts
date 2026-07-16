import api from "./api";

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
};