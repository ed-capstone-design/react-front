import { apiClient } from "../apiClient";

const BASE_URL = "/api/admin/drivers";
export const driverService = {
  //운전자 전체 조회
  getAllDrivers: async () => {
    const response = await apiClient.get(`${BASE_URL}`);
    return response.data;
  },
  //운전자 정보 수정
  updateDriverInfo: async (driverId, updateData) => {
    const response = await apiClient.patch(
      `${BASE_URL}/${driverId}`,
      updateData
    );
    return response.data;
  },
  //운전자 삭제
  deleteDriver: async (driverId) => {
    const response = await apiClient.delete(`${BASE_URL}/${driverId}`);
    return response.data;
  },
  //특정 운전자 조회
  getDriver: async (driverId) => {
    const response = await apiClient.get(`${BASE_URL}/${driverId}`);
    return response.data;
  },
  //특정 운전자 기간별 배차 조히
  getDriverDispatch: async (driverId, startDate, endDate) => {
    const response = await apiClient.get(`${BASE_URL}/${driverId}/dispatches`, {
      params: { startDate, endDate },
    });
    return response.data;
  },
  //특정 운전자 경고목록 조회(기간별, 최신순)
  getDriverEvent: async (driverId, startDate, endDate) => {
    const response = await apiClient.get(`${BASE_URL}/${driverId}/events`, {
      params: { startDate, endDate },
    });
    return response.data;
  },
};
