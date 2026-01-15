import { jwtDecode } from "jwt-decode"; // ✨ 오타 수정
import dayjs from "dayjs";
const ACCESS_TOKEN_KEY = "accessToken"; // ✨ 오타 수정 (s 두 개)

// 내부 전용: 안전한 로컬스토리지 래퍼 (Safety Wrapper)
//어떤 환경이나 상황에서도 깨지지 않는 견고한 데이터 접근 객체
const storage = {
  get: (key) => {
    try {
      if (typeof window === "undefined") return null;
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting key "${key}":`, error);
      return null;
    }
  },
  set: (key, value) => {
    try {
      if (typeof window === "undefined") return;
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting key "${key}":`, error);
    }
  },
  remove: (key) => {
    try {
      if (typeof window === "undefined") return;
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing key "${key}":`, error);
    }
  },
};

// 외부 공개용: 토큰 비즈니스 로직
export const tokenStorage = {
  get: () => storage.get(ACCESS_TOKEN_KEY),
  set: (token) => storage.set(ACCESS_TOKEN_KEY, token),
  remove: () => storage.remove(ACCESS_TOKEN_KEY),
  getUser: () => {
    const token = storage.get(ACCESS_TOKEN_KEY);
    if (!token) return null;
    try {
      const decoded = jwtDecode(token);
      const isExpired = dayjs().unix() > decoded.exp;
      if (isExpired) {
        storage.remove(ACCESS_TOKEN_KEY);
        return null;
      }
      return decoded;
    } catch (error) {
      return null;
    }
  },
};
