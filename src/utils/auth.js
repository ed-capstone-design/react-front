import axios from 'axios';

// 토큰 관리 유틸리티 함수들
export const authUtils = {
  // 토큰 저장
  setToken: (token) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  // 토큰 가져오기
  getToken: () => {
    return localStorage.getItem('token');
  },

  // 토큰 삭제 (로그아웃)
  removeToken: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminId');
    localStorage.removeItem('adminName');
    localStorage.removeItem('operatorId');
    delete axios.defaults.headers.common['Authorization'];
  },

  // 토큰 유효성 검사 (만료 확인)
  isTokenValid: () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      // JWT 토큰 디코딩 (간단한 만료 확인)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  },

  // 앱 시작 시 토큰 복원
  initializeAuth: () => {
    const token = localStorage.getItem('token');
    if (token && authUtils.isTokenValid()) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return true;
    } else {
      authUtils.removeToken();
      return false;
    }
  }
};
