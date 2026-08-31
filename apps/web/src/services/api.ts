import axios from "axios";

import { getApiBaseUrl } from "../config/environment";

const api = axios.create();

api.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();

  const token = localStorage.getItem(
    "access_token",
  );

  if (token) {
    config.headers.Authorization =
      `Bearer ${token}`;
  }

  return config;
});

export default api;