import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const TokenContext = createContext({
  getToken: () => null,
  setToken: () => {},
  removeToken: () => {},
  isTokenValid: () => true,
  getUserInfoFromToken: () => null,
  // 새로운 사용자 정보 관리 함수들
  getUserInfo: () => null,
  setUserInfo: () => {},
  clearUserInfo: () => {},
  login: () => {},
  logout: () => {},
});

export const useToken = () => useContext(TokenContext);

export const TokenProvider = ({ children }) => {
  // 사용자 정보 상태 관리
  const [userInfo, setUserInfoState] = useState(null);

  // 토큰 가져오기
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // 사용자 정보 가져오기
  const getUserInfo = () => {
    if (userInfo) return userInfo;
    
    // 메모리에 없으면 localStorage에서 가져오기
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      try {
        const parsed = JSON.parse(storedUserInfo);
        setUserInfoState(parsed);
        return parsed;
      } catch (e) {
        console.error('사용자 정보 파싱 오류:', e);
        localStorage.removeItem('userInfo');
      }
    }
    return null;
  };

  // 사용자 정보 저장
  const setUserInfo = (info) => {
    setUserInfoState(info);
    localStorage.setItem('userInfo', JSON.stringify(info));
  };

  // 사용자 정보 삭제
  const clearUserInfo = () => {
    setUserInfoState(null);
    localStorage.removeItem('userInfo');
  };

  // 토큰 저장 (axios 헤더 자동 설정)
  const setToken = (token) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  // 토큰 삭제 (헤더도 삭제)
  const removeToken = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  // 로그인 (토큰과 사용자 정보 함께 저장)
  const login = (loginResponse) => {
    const { token, userId, email, username, roles } = loginResponse;
    
    // 토큰 저장
    setToken(token);
    
    // 사용자 정보 저장
    const userInfo = {
      userId,
      email,
      username,
      roles,
      loginTime: new Date().toISOString()
    };
    setUserInfo(userInfo);
    
    return userInfo;
  };

  // 로그아웃 (토큰과 사용자 정보 모두 삭제)
  const logout = () => {
    removeToken();
    clearUserInfo();
  };

  // 앱 시작 시 기존 토큰이 있으면 axios 헤더에 설정하고 사용자 정보 복원
  useEffect(() => {
    const existingToken = getToken();
    if (existingToken && isTokenValid()) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${existingToken}`;
      // 사용자 정보도 복원
      getUserInfo();
    } else {
      // 토큰이 유효하지 않으면 모든 정보 삭제
      logout();
    }
  }, []);

  // 토큰에서 사용자 정보 추출
  // 안전한 JWT 파싱 (한글 깨짐 방지)
  function parseJwt(token) {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  const getUserInfoFromToken = () => {
    const token = getToken();
    if (!token) return null;
    try {
      const payload = parseJwt(token);
      if (!payload) return null;
      // JWT 표준 클레임 검증
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < currentTime) {
        console.warn("토큰이 만료되었습니다.");
        return null;
      }
      if (payload.aud && payload.aud !== "driving-app") {
        console.warn("토큰 대상자가 일치하지 않습니다.");
        return null;
      }
      return {
        userId: payload.userId || payload.sub,
        username: payload.username || payload.sub,
        name: payload.name || payload.displayName || "사용자",
        email: payload.email || "",
        role: payload.role || "user",
        sub: payload.sub,//누구냐->userId,,role operator
        aud: payload.aud,//어디서 사용하느냐 
        iat: payload.iat,//접속시간
        exp: payload.exp,//유효시간
        operatorId: payload.operatorId || "UNKNOWN",
        authorities: payload.authorities || [],
        driverLicense: payload.driverLicense || null,
      };
    } catch (error) {
      console.error("토큰 파싱 실패:", error);
      return null;
    }
  };

  // 토큰 유효성 검사 (간단한 만료 확인만)
  const isTokenValid = () => {
    const token = getToken();
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      // 만료 시간 확인
      if (payload.exp && payload.exp < currentTime) {
        return false;
      }
      
      // 대상자 확인 (선택적)
      if (payload.aud && payload.aud !== "driving-app") {
        return false;
      }
      
      // 발급 시간 확인 (미래 토큰 방지)
      if (payload.iat && payload.iat > currentTime + 300) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("토큰 유효성 검사 실패:", error);
      return false;
    }
  };

  return (
    <TokenContext.Provider value={{ 
      // 기존 토큰 관련 함수들
      getToken, 
      setToken, 
      removeToken, 
      isTokenValid, 
      getUserInfoFromToken,
      // 새로운 사용자 정보 관리 함수들
      getUserInfo,
      setUserInfo,
      clearUserInfo,
      login,
      logout
    }}>
      {children}
    </TokenContext.Provider>
  );
};
