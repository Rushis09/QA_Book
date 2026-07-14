import api from "./api";

import type {
  TestSuite,
  TestSuiteRequest,
} from "../types/testSuite";

export const testSuiteService = {
  async getTestSuites(): Promise<TestSuite[]> {
    const response = await api.get<TestSuite[]>(
      "/test-suites/",
    );

    return response.data;
  },
  
  async getTestSuite(
    id: number,
  ): Promise<TestSuite> {
    const response = 
    await api.get<TestSuite>(
      `/test-suites/${id}`,
    );  

    return response.data;
  },

  async createTestSuite(
    data: TestSuiteRequest,
  ): Promise<TestSuite> {
    const response = await api.post<TestSuite>(
      "/test-suites/",
      data,
    );

    return response.data;
  },

  async updateTestSuite(
    id: number,
    data: TestSuiteRequest,
  ): Promise<TestSuite> {
    const response = await api.put<TestSuite>(
      `/test-suites/${id}`,
      data,
    );

    return response.data;
  },

  async assignTestCases(
    id: number,
    testCaseIds: number[],
  ): Promise<TestSuite> {
    const response = await api.put<TestSuite>(
      `/test-suites/${id}/test-cases`,
      {
        test_case_ids: testCaseIds,
      },
    );

    return response.data;
  },

  async deleteTestSuite(
    id: number,
  ): Promise<void> {
    await api.delete(
      `/test-suites/${id}`,
    );
  },
};
