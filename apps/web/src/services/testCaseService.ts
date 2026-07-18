import api from "./api";

import type {
  TestCase,
  TestCaseRequest,
} from "../types/testCase";

const BASE_URL = "/test-cases";

export const testCaseService = {
  async getTestCases(
    projectId?: number,
  ): Promise<TestCase[]> {
    const response =
      await api.get<TestCase[]>(
        BASE_URL,
        {
          params: {
            project_id: projectId,
          },
        },
      );

    return response.data;
  },

  async getTestCase(
    id: number,
  ): Promise<TestCase> {
    const response =
      await api.get<TestCase>(
        `${BASE_URL}/${id}`,
      );

    return response.data;
  },

  async createTestCase(
    data: TestCaseRequest,
  ): Promise<TestCase> {
    const response =
      await api.post<TestCase>(
        BASE_URL,
        data,
      );

    return response.data;
  },

  async updateTestCase(
    id: number,
    data: TestCaseRequest,
  ): Promise<TestCase> {
    const response =
      await api.put<TestCase>(
        `${BASE_URL}/${id}`,
        data,
      );

    return response.data;
  },

  async deleteTestCase(
    id: number,
  ): Promise<void> {
    await api.delete(
      `${BASE_URL}/${id}`,
    );
  },
};