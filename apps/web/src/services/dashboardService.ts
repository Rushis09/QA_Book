import api from "./api";

import type { DashboardSummary } from "../types/dashboard";

const BASE_URL = "/dashboard";

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const response =
      await api.get<DashboardSummary>(
        `${BASE_URL}/summary`,
      );

    return response.data;
  },
};