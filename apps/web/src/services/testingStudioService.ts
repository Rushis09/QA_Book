import api from "./api";
import type { StudioScenario, StudioTestCase, StudioTestCaseRequest, TestingType } from "../types/testingStudio";

const BASE_URL = "/testing-studio";

export const testingStudioService = {
  async getScenarios(projectId: number): Promise<StudioScenario[]> {
    const response = await api.get<StudioScenario[]>(`${BASE_URL}/projects/${projectId}/scenarios`);
    return response.data;
  },
  async getTestCases(projectId: number, type?: TestingType): Promise<StudioTestCase[]> {
    const response = await api.get<StudioTestCase[]>(`${BASE_URL}/projects/${projectId}/test-cases`, { params: type ? { testing_type: type } : undefined });
    return response.data;
  },
  async createTestCase(projectId: number, data: StudioTestCaseRequest): Promise<StudioTestCase> {
    const response = await api.post<StudioTestCase>(`${BASE_URL}/projects/${projectId}/test-cases`, data);
    return response.data;
  },
  async updateTestCase(projectId: number, testCaseId: number, data: StudioTestCaseRequest): Promise<StudioTestCase> {
    const response = await api.put<StudioTestCase>(`${BASE_URL}/projects/${projectId}/test-cases/${testCaseId}`, data);
    return response.data;
  },
  async deleteTestCase(projectId: number, testCaseId: number): Promise<void> {
    await api.delete(`${BASE_URL}/projects/${projectId}/test-cases/${testCaseId}`);
  },
  async uploadEvidence(testCaseId: number, file: File) {
    const data = new FormData();
    data.append("file", file);
    const response = await api.post(`${BASE_URL}/test-cases/${testCaseId}/evidence`, data);
    return response.data;
  },
  async exportTestCases(projectId: number, type?: TestingType): Promise<Blob> {
    const response = await api.get(`${BASE_URL}/projects/${projectId}/export`, { params: type ? { testing_type: type } : undefined, responseType: "blob" });
    return response.data;
  },
};
