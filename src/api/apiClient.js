import axios from "axios";
import { tokenStorage } from "../components/Token/tokenStorage";

// 1. Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
  // [중요] Refresh Token을 쿠키로 주고받기 위해 자격 증명 포함 설정 활성화
  withCredentials: true,
});

// 2. Request Interceptor (요청 가로채기)
// 역할: 모든 API 요청 전, 로컬 스토리지의 Access Token을 헤더에 주입
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = tokenStorage.get();
    // 토큰이 존재할 경우 Authorization 헤더에 Bearer 스키마로 추가
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    // 요청 설정 단계에서 에러 발생 시 처리
    return Promise.reject(error);
  }
);

// 3. Response Interceptor (응답 가로채기)
// 역할: 401 에러(토큰 만료) 감지 시, Access Token 재발급 및 실패한 요청 재시도
// 토큰 갱신 진행 상태를 추적하는 플래그 (중복 갱신 요청 방지)
let isRefreshing = false;
// 토큰 갱신 중 대기하게 된 요청들의 콜백 함수를 모아두는 큐 (Concurrency Control)
let refreshSubscribers = [];
// 대기 중인 요청(Promise)들을 재개시키는 함수
const onRefreshed = (accessToken) => {
  refreshSubscribers.forEach((callback) => callback(accessToken));
  refreshSubscribers = []; // 대기열 초기화
};

apiClient.interceptors.response.use(
  (response) => {
    if (response.status === 204) return null; //성공 후 응답의 body가 없음
    return response.data; //데이터 형시 변환 response -> AsyncState
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // [조건] 401 Unauthorized 에러 발생 AND 아직 재시도하지 않은 요청인 경우
    if (status === 401 && !originalRequest._retry) {
      // A. 이미 다른 요청에 의해 토큰 갱신이 진행 중인 경우 (동시성 제어)
      if (isRefreshing) {
        // 새로운 Promise를 생성하여 요청을 대기 상태(Pending)로 유지
        return new Promise((resolve) => {
          refreshSubscribers.push((token) => {
            // 새 토큰으로 헤더를 교체하고 재요청 수행
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      // B. 토큰 갱신을 처음 시도하는 경우 (Blocking)
      originalRequest._retry = true; // 무한 루프 방지를 위한 플래그 설정
      isRefreshing = true; // 갱신 상태로 전환

      try {
        // 백엔드에 Refresh Token을 이용한 Access Token 재발급 요청
        // (withCredentials: true 설정으로 쿠키가 자동 전송됨)
        const responseData = await apiClient.post("/api/auth/refresh");

        // 응답 구조에 따라 토큰 추출 (data.data.accessToken 등 구조 확인 필수)
        const newAccessToken =
          responseData.data?.accessToken || responseData.accessToken;

        if (!newAccessToken) {
          throw new Error("새로운 토큰 없음");
        }
        // 1. 스토리지에 새 토큰 저장
        tokenStorage.set(newAccessToken);
        // 2. 대기열(Queue)에 쌓인 요청들에 새 토큰 브로드캐스트 및 재개
        onRefreshed(newAccessToken);

        // 3. 실패했던 최초 요청의 헤더 갱신 및 재시도
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // [심각] 리프레시 토큰조차 만료되었거나 갱신 실패 시
        console.error(`토큰 갱신 실패 ${status}:${refreshError.message}`);
        // 보안을 위해 잔여 토큰 삭제
        tokenStorage.remove();
        // 로그인 페이지로 강제 리다이렉트 (React 외부이므로 window.location 사용)
        window.location.href = "/auth";

        return Promise.reject(refreshError);
      } finally {
        // 성공/실패 여부와 관계없이 갱신 상태 해제
        isRefreshing = false;
      }
    }
    if (status >= 500) {
      alert("서버에 문제 발생. 잠시 후 다시 시도해주세요");
    }
    if (status === 403) {
      console.warn("권한이 없는 요청입니다.");
    }
    const safeError = {
      status: status || 500,
      message:
        error.response?.data?.message ||
        error.message ||
        "서버와 통신 중 문제가 발생했습니다",
      code: error.response?.data?.code || error.code,
    };
    // 401 에러가 아니거나 재시도 불가능한 에러는 그대로 전파
    return Promise.reject(safeError);
  }
);
