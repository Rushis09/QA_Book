import api from "./api";

import type {
  ReportSummary,
  RequirementCoverageResponse,
  TraceabilityResponse,
} from "../types/report";

const BASE_URL = "/reports";

export const reportService = {
  async getSummary(
    projectId?: number,
  ): Promise<ReportSummary> {
    const response =
      await api.get<ReportSummary>(
        `${BASE_URL}/summary`,
        {
          params:
            projectId !== undefined
              ? { project_id: projectId }
              : undefined,
        },
      );

    return response.data;
  },

  async getRequirementCoverage(
    projectId?: number,
  ): Promise<RequirementCoverageResponse> {
    const response =
      await api.get<RequirementCoverageResponse>(
        `${BASE_URL}/coverage`,
        {
          params:
            projectId !== undefined
              ? { project_id: projectId }
              : undefined,
        },
      );

    return response.data;
  },

  async getTraceability(
    projectId?: number,
  ): Promise<TraceabilityResponse> {
    const response =
      await api.get<TraceabilityResponse>(
        `${BASE_URL}/traceability`,
        {
          params:
            projectId !== undefined
              ? { project_id: projectId }
              : undefined,
        },
      );

    return response.data;
  },
};