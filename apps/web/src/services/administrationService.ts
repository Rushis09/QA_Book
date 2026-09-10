import api from "./api";

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminUserCreateRequest {
  username: string;
  email: string;
  password: string;
  role: string;
}

export interface AdminUserUpdateRequest {
  username?: string;
  email?: string;
  role?: string;
}

export interface AdminUserStatusUpdateRequest {
  is_active: boolean;
}

export interface AdminUserPasswordResetRequest {
  new_password: string;
}

export interface AdminActionResponse {
  message: string;
}

const administrationService = {
  async getUsers(): Promise<AdminUser[]> {
    const response =
      await api.get<AdminUser[]>(
        "/administration/users",
      );

    return response.data;
  },

  async getUser(
    userId: number,
  ): Promise<AdminUser> {
    const response =
      await api.get<AdminUser>(
        `/administration/users/${userId}`,
      );

    return response.data;
  },

  async createUser(
    data: AdminUserCreateRequest,
  ): Promise<AdminUser> {
    const response =
      await api.post<AdminUser>(
        "/administration/users",
        data,
      );

    return response.data;
  },

  async updateUser(
    userId: number,
    data: AdminUserUpdateRequest,
  ): Promise<AdminUser> {
    const response =
      await api.patch<AdminUser>(
        `/administration/users/${userId}`,
        data,
      );

    return response.data;
  },

  async updateUserStatus(
    userId: number,
    data: AdminUserStatusUpdateRequest,
  ): Promise<AdminUser> {
    const response =
      await api.patch<AdminUser>(
        `/administration/users/${userId}/status`,
        data,
      );

    return response.data;
  },

  async resetUserPassword(
    userId: number,
    data: AdminUserPasswordResetRequest,
  ): Promise<AdminActionResponse> {
    const response =
      await api.post<AdminActionResponse>(
        `/administration/users/${userId}/reset-password`,
        data,
      );

    return response.data;
  },
};

export default administrationService;