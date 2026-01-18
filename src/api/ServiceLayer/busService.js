import { apiClient } from "../apiClient";

const BASE_URL = "/api/admin/buses";

export const busService = {
  //전체 버스 조회
  getAllBuses: async () => {
    const response = await apiClient.get(`${BASE_URL}`);
    return response.data;
  },
  //버스 추가
  createNewBus: async (data) => {
    const response = await apiClient.post(`${BASE_URL}`, data);
    return response.data;
  },
  //버스 수정
  updateBusInfo: async (buseId, data) => {
    const response = await apiClient.patch(`${BASE_URL}/${buseId}`, data);
    return response.data;
  },
  //버스 삭제
  deleteBus: async (buseId) => {
    const response = await apiClient.delete(`${BASE_URL}/${buseId}`);
    return response.data;
  },
  //단일 버스 조회
  getBuseInfo: async (buseId) => {
    const response = await apiClient.get(`${BASE_URL}/${buseId}`);
    return response.data;
  },
};
