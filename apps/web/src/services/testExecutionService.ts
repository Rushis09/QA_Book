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
    const response = await api.get<TestExecution[]>(
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
  ): Promise<TestExecutionSummary> 
   {
    const response = await api.get(
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
    execution: TestExecution,
    status: string,
    actualResult: string,
    comments: string,
  ): TestExecutionUpdateRequest {
    return {
      run_id: execution.run_id,
      test_case_id:
        execution.test_case_id,
      status,
      actual_result: actualResult,
      comments,
      executed_by:
        execution.executed_by,
      executed_at:
        execution.executed_at,
    };
  },
};