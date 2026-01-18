import { apiClient } from "../apiClient";

const BASE_URL = "/api/admin/dispatches";

export const dispatchService = {
  // 1. 특정 배차 운행 기록 (통계 조회)
  // GET /api/admin/dispatches/{id}/driving-record
  getDispatchRecord: async (dispatchId) => {
    const response = await apiClient.get(
      `${BASE_URL}/${dispatchId}/driving-record`
    );
    return response.data;
  },
  // 2. 특정 배차의 운행 이벤트 (최신순)
  // GET /api/admin/dispatches/{id}/driving-events
  getDispatchEvents: async (dispatchId) => {
    // Sort 파라미터 제거됨
    const response = await apiClient.get(
      `${BASE_URL}/${dispatchId}/driving-events`
    );
    return response.data;
  },

  // 3. 특정 배차의 과거 운행 경로 (오래된 순)
  // GET /api/admin/dispatches/{id}/paths
  getDispatchPath: async (dispatchId) => {
    // Sort 파라미터 제거됨
    const response = await apiClient.get(`${BASE_URL}/${dispatchId}/paths`);
    return response.data;
  },

  // 4. 배차 가능 운전자 목록 조회
  // GET /api/admin/dispatches/available-drivers?startDate=...&endDate=...
  getAvailableDrivers: async (startDate, endDate) => {
    const response = await apiClient.get(`${BASE_URL}/available-drivers`, {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // 5. 배차 가능 버스 목록 조회
  // GET /api/admin/dispatches/available-buses?startDate=...&endDate=...
  getAvailableBuses: async (startDate, endDate) => {
    const response = await apiClient.get(`${BASE_URL}/available-buses`, {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // 6. 배차 목록 조회 (날짜필수, 상태는 선택)
  // GET /api/admin/dispatches?startDate=...&endDate=...&status=...
  getDispatches: async (startDate, endDate, status) => {
    const params = { startDate, endDate };
    if (status) params.status = status;

    const response = await apiClient.get(`${BASE_URL}`, { params });
    return response.data;
  },

  // 7. 배차 일지 상세 조회
  // GET /api/admin/dispatches/{id}
  getDispatchDetail: async (dispatchId) => {
    const response = await apiClient.get(`${BASE_URL}/${dispatchId}`);
    return response.data;
  },

  // 8. 배차 추가 (등록)
  // POST /api/admin/dispatches
  createDispatch: async (dispatchData) => {
    const response = await apiClient.post(`${BASE_URL}`, dispatchData);
    return response.data;
  },

  // 9. 운행 시작
  // PATCH /api/admin/dispatches/{id}/start
  startDispatch: async (dispatchId) => {
    const response = await apiClient.patch(`${BASE_URL}/${dispatchId}/start`);
    return response.data;
  },

  // 10. 운행 종료
  // PATCH /api/admin/dispatches/{id}/comple
  completeDispatch: async (dispatchId) => {
    const response = await apiClient.patch(`${BASE_URL}/${dispatchId}/end`);
    return response.data;
  },

  // 11. 배차 취소 (삭제)
  // PATCH /api/admin/dispatches/{id}/cancel
  cancelDispatch: async (dispatchId) => {
    const response = await apiClient.delete(`${BASE_URL}/${dispatchId}/cancel`);
    return response.data;
  },
};
