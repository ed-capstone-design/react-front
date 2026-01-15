import { apiClient } from "../apiClient";
import { tokenStorage } from "../../components/Token/tokenStorage";

const AUTH_URL = "/api/auth";
export const authService = {
  signup: async (userData) => {
    const response = await apiClient.post(`${AUTH_URL}/signup`, userData);
    return response.data;
  },
  login: async (credentials) => {
    const response = await apiClient.post(`${AUTH_URL}/login`, credentials);
    const { accessToken, ...userInfo } = response.data;

    if (accessToken) {
      tokenStorage.set(accessToken);
    }
    return userInfo;
  },
  logout: async () => {
    try {
      await apiClient.post(`${AUTH_URL}/logout`);
    } catch (error) {
      console.warn("로그아웃 서버 요청 실패:", error);
    } finally {
      tokenStorage.remove();
    }
  },
  refresh: async () => {
    const response = await apiClient.post(`${AUTH_URL}/refresh`);
    return response.data;
  },
};
