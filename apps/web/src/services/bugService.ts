import api from "./api";

import type {
  Bug,
  BugRequest,
} from "../types/bug";

const BASE_URL = "/bugs";

export const bugService = {
  async getBugs(): Promise<Bug[]> {
    const response =
      await api.get<Bug[]>(
        BASE_URL,
      );

    return response.data;
  },

  async getBug(
    id: number,
  ): Promise<Bug> {
    const response =
      await api.get<Bug>(
        `${BASE_URL}/${id}`,
      );

    return response.data;
  },

  async createBug(
    data: BugRequest,
  ): Promise<Bug> {
    const response =
      await api.post<Bug>(
        BASE_URL,
        data,
      );

    return response.data;
  },

  async updateBug(
    id: number,
    data: BugRequest,
  ): Promise<Bug> {
    const response =
      await api.put<Bug>(
        `${BASE_URL}/${id}`,
        data,
      );

    return response.data;
  },

  async deleteBug(
    id: number,
  ): Promise<void> {
    await api.delete(
      `${BASE_URL}/${id}`,
    );
  },
};