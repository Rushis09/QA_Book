import api from "./api";
import type {
  TestScenario,
  TestScenarioRequest,
} from "../types/testScenario";

const BASE_URL = "/test-scenarios";


export const testScenarioService = {
  async getTestScenarios(
    projectId?: number,
  ): Promise<TestScenario[]> {
    const response =
      await api.get<TestScenario[]>(BASE_URL, {
        params: projectId
          ? { project_id: projectId }
          : undefined,
      });
    
    return response.data;
  },

  async getTestScenario(id: number): Promise<TestScenario> {
    const response = await api.get<TestScenario>(
      `${BASE_URL}/${id}`,
    );

    return response.data;
  },

  async createTestScenario(
    data: TestScenarioRequest,
  ): Promise<TestScenario> {
    const response = await api.post<TestScenario>(
      BASE_URL,
      data,
    );

    return response.data;
  },

  async updateTestScenario(
    id: number,
    data: TestScenarioRequest,
  ): Promise<TestScenario> {
    const response = await api.put<TestScenario>(
      `${BASE_URL}/${id}`,
      data,
    );

    return response.data;
  },

  async deleteTestScenario(
    id: number,
  ): Promise<void> {
    await api.delete(`${BASE_URL}/${id}`);
  },
};