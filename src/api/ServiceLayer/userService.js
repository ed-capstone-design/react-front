import { apiClient } from "../apiClient";

const USER_URL = "/api/users";

export const userService = {
  //1. 내 정보 조회
  getMe: async () => {
    const data = await apiClient.get(`${USER_URL}/me`);
    return data;
  },
  // 2. 내 정보 수정 (전화번호, 면허번호 등)
  updateProfile: async (userData) => {
    const response = await apiClient.patch(`${USER_URL}/me`, userData);
    return response.data;
  },

  // 3. 비밀번호 변경
  updatePassword: async (passwordData) => {
    // passwordData: { currentPassword, newPassword }
    const response = await apiClient.patch(
      `${USER_URL}/me/password`,
      passwordData
    );
    return response.data;
  },
  // 4. 회원 탈퇴
  withdraw: async () => {
    const response = await apiClient.delete(`${USER_URL}/me`);
    return response.data;
  },
};
