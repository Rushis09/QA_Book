import api from "./api";

import type {
  ReportSummary,
  RequirementCoverageResponse,
  TraceabilityResponse,
} from "../types/report";

const BASE_URL = "/reports";

export const reportService = {
  async getSummary(): Promise<ReportSummary> {
    const response =
      await api.get<ReportSummary>(
        `${BASE_URL}/summary`,
      );

    return response.data;
  },
  
  async getRequirementCoverage():
  Promise<RequirementCoverageResponse> {
    const response =
    await api.get<RequirementCoverageResponse>(
      `${BASE_URL}/coverage`,
    );
    
    return response.data;
  },
  
  async getTraceability():
  Promise<TraceabilityResponse> {
    const response =
    await api.get<TraceabilityResponse>(
      `${BASE_URL}/traceability`,
    );
    
    return response.data;
  },
};