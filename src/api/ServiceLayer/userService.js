import { apiClient } from "../apiClient";

const USER_URL = "/api/users";

export const userService = {
  getMe: async () => {
    const response = await apiClient.get(`${USER_URL}/me`);
    return response.data;
  },
};
