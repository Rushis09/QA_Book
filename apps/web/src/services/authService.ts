import axios from "axios";

import { getProductionApiUrl } from "../config/environment";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export async function login(
  data: LoginRequest,
): Promise<LoginResponse> {
  const response = await axios.post(
    `${getProductionApiUrl()}/auth/login`,
    data,
  );

  return response.data;
}