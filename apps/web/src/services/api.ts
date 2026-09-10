import axios from "axios";

import { getApiBaseUrl } from "../config/environment";

const api = axios.create({
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();

  const token = localStorage.getItem(
    "access_token",
  );

  if (token) {
    config.headers.Authorization =
      `Bearer ${token}`;
  }

  window.dispatchEvent(
    new CustomEvent("qabook:api-loading-start"),
  );

  return config;
});

api.interceptors.response.use(
  (response) => {
    window.dispatchEvent(
      new CustomEvent("qabook:api-loading-stop"),
    );

    return response;
  },
  (error) => {
    window.dispatchEvent(
      new CustomEvent("qabook:api-loading-stop"),
    );

    return Promise.reject(error);
  },
);

export default api;