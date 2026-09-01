import api from "./api";

import type {
  TestSuite,
  TestSuiteRequest,
} from "../types/testSuite";

const BASE_URL = "/test-suites";

export const testSuiteService = {
  async getTestSuites(
    projectId: number,
  ): Promise<TestSuite[]> {
    const response =
      await api.get<TestSuite[]>(
        BASE_URL,
        {
          params: {
            project_id: projectId,
          },
        },
      );

    return response.data;
  },

  async getTestSuite(
    id: number,
  ): Promise<TestSuite> {
    const response =
      await api.get<TestSuite>(
        `${BASE_URL}/${id}`,
      );

    return response.data;
  },

  async createTestSuite(
    data: TestSuiteRequest,
  ): Promise<TestSuite> {
    const response =
      await api.post<TestSuite>(
        BASE_URL,
        data,
      );

    return response.data;
  },

  async updateTestSuite(
    id: number,
    data: TestSuiteRequest,
  ): Promise<TestSuite> {
    const response =
      await api.put<TestSuite>(
        `${BASE_URL}/${id}`,
        data,
      );

    return response.data;
  },

  async assignTestCases(
    id: number,
    testCaseIds: number[],
  ): Promise<TestSuite> {
    const response =
      await api.put<TestSuite>(
        `${BASE_URL}/${id}/test-cases`,
        {
          test_case_ids: testCaseIds,
        },
      );

    return response.data;
  },

  async recommendTestCases(
    suiteId: number,
    testCaseIds: number[],
  ): Promise<number[]> {
    const response =
      await api.post<{
        recommended_test_case_ids: number[];
      }>(
        "/ai/recommend-test-cases",
        {
          suite_id: suiteId,
          test_case_ids: testCaseIds,
        },
      );

    return response.data
      .recommended_test_case_ids;
  },

  async deleteTestSuite(
    id: number,
  ): Promise<void> {
    await api.delete(
      `${BASE_URL}/${id}`,
    );
  },
};