import { apiClient } from "../apiClient";

const USER_URL = "/api/users";

export const userService = {
  getMe: async () => {
    const data = await apiClient.get(`${USER_URL}/me`);
    return data;
  },
};
