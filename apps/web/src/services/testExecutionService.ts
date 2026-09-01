import api from "./api";

import type {
  TestExecution,
  TestExecutionSummary,
  TestExecutionUpdateRequest,
} from "../types/testExecution";

const BASE_URL = "/test-executions";

export const testExecutionService = {
  async getRunExecutions(
    runId: number,
  ): Promise<TestExecution[]> {
    const response =
      await api.get<TestExecution[]>(
        `${BASE_URL}/run/${runId}`,
      );

    return response.data;
  },

  async getExecutions(): Promise<
    TestExecution[]
  > {
    const response =
      await api.get<TestExecution[]>(
        BASE_URL,
      );

    return response.data;
  },

  async getExecutionSummary(
    runId: number,
  ): Promise<TestExecutionSummary> {
    const response =
      await api.get<TestExecutionSummary>(
        `${BASE_URL}/run/${runId}/summary`,
      );

    return response.data;
  },

  async updateExecution(
    executionId: number,
    data: TestExecutionUpdateRequest,
  ): Promise<TestExecution> {
    const response =
      await api.put<TestExecution>(
        `${BASE_URL}/${executionId}`,
        data,
      );

    return response.data;
  },

  buildUpdateRequest(
    _execution: TestExecution,
    status: string,
    actualResult: string,
    comments: string,
  ): TestExecutionUpdateRequest {
    return {
      status,
      actual_result: actualResult,
      comments,
      executed_by:
        _execution.executed_by,
      executed_at:
        _execution.executed_at,
    };
  },
};