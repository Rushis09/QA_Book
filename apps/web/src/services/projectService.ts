import api from "./api";

import type {
  Project,
  ProjectRequest,
} from "../types/project";

export interface WorkspaceUser {
  id: number;
  username: string;
}

export const projectService = {
  async getProjects(
    ownerId?: number,
  ): Promise<Project[]> {
    const response = await api.get<Project[]>(
      "/projects/",
      {
        params:
          ownerId !== undefined
            ? { owner_id: ownerId }
            : undefined,
      },
    );

    return response.data;
  },

  async getWorkspaceUsers(): Promise<WorkspaceUser[]> {
    const response =
      await api.get<WorkspaceUser[]>(
        "/auth/workspace-users",
      );

    return response.data;
  },

  async getProject(
    id: number,
  ): Promise<Project> {
    const response =
      await api.get<Project>(
        `/projects/${id}`,
      );

    return response.data;
  },

  async createProject(
    project: ProjectRequest,
  ): Promise<Project> {
    const response =
      await api.post<Project>(
        "/projects/",
        project,
      );

    return response.data;
  },

  async updateProject(
    id: number,
    project: ProjectRequest,
  ): Promise<Project> {
    const response =
      await api.put<Project>(
        `/projects/${id}`,
        project,
      );

    return response.data;
  },

  async deleteProject(
    id: number,
  ): Promise<void> {
    await api.delete(`/projects/${id}`);
  },
};