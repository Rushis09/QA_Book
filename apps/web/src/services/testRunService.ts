import api from "./api";

import type {
  TestRun,
  TestRunRequest,
} from "../types/testRun";

const BASE_URL = "/test-runs";

export const testRunService = {
  async getTestRuns(): Promise<TestRun[]> {
    const response = await api.get<TestRun[]>(
      BASE_URL,
    );

    return response.data;
  },

  async getTestRun(
    id: number,
  ): Promise<TestRun> {
    const response =
      await api.get<TestRun>(
        `${BASE_URL}/${id}`,
      );

    return response.data;
  },

  async createTestRun(
    data: TestRunRequest,
  ): Promise<TestRun> {
    const response =
      await api.post<TestRun>(
        BASE_URL,
        data,
      );

    return response.data;
  },

  async updateTestRun(
    id: number,
    data: TestRunRequest,
  ): Promise<TestRun> {
    const response =
      await api.put<TestRun>(
        `${BASE_URL}/${id}`,
        data,
      );

    return response.data;
  },

  async finishTestRun(
    id: number,
  ): Promise<TestRun> {
    const response =
      await api.post<TestRun>(
        `${BASE_URL}/${id}/finish`,
      );

    return response.data;
  },

  async deleteTestRun(
    id: number,
  ): Promise<void> {
    await api.delete(
      `${BASE_URL}/${id}`,
    );
  },
};