import api from "./api";

import type {
  ReportOverview,
  ExecutionAnalytics,
  CoverageAnalytics,
  DefectAnalytics,
  RiskAnalytics,
  TraceabilityAnalytics,
} from "../types/report";

const BASE_URL = "/reports";

const projectParams = (projectId?: number) =>
  projectId !== undefined
    ? { project_id: projectId }
    : undefined;

export const reportService = {
  async getOverview(
    projectId?: number,
  ): Promise<ReportOverview> {
    const response =
      await api.get<ReportOverview>(
        `${BASE_URL}/overview`,
        {
          params: projectParams(projectId),
        },
      );

    return response.data;
  },

  async getExecutionAnalytics(
    projectId?: number,
  ): Promise<ExecutionAnalytics> {
    const response =
      await api.get<ExecutionAnalytics>(
        `${BASE_URL}/execution`,
        {
          params: projectParams(projectId),
        },
      );

    return response.data;
  },

  async getCoverageAnalytics(
    projectId?: number,
  ): Promise<CoverageAnalytics> {
    const response =
      await api.get<CoverageAnalytics>(
        `${BASE_URL}/coverage`,
        {
          params: projectParams(projectId),
        },
      );

    return response.data;
  },

  async getDefectAnalytics(
    projectId?: number,
  ): Promise<DefectAnalytics> {
    const response =
      await api.get<DefectAnalytics>(
        `${BASE_URL}/defects`,
        {
          params: projectParams(projectId),
        },
      );

    return response.data;
  },

  async getQualityRisk(
    projectId?: number,
  ): Promise<RiskAnalytics> {
    const response =
      await api.get<RiskAnalytics>(
        `${BASE_URL}/risk`,
        {
          params: projectParams(projectId),
        },
      );

    return response.data;
  },

  async getTraceabilityAnalytics(
    projectId?: number,
  ): Promise<TraceabilityAnalytics> {
    const response =
      await api.get<TraceabilityAnalytics>(
        `${BASE_URL}/traceability`,
        {
          params: projectParams(projectId),
        },
      );

    return response.data;
  },
};