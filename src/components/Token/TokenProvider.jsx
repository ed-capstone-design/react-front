import React, { createContext, useContext, useEffect } from 'react';
import axios from 'axios';

const TokenContext = createContext({
  getToken: () => null,
  setToken: () => {},
  removeToken: () => {},
  isTokenValid: () => true,
  getUserInfoFromToken: () => null,
});

export const useToken = () => useContext(TokenContext);

export const TokenProvider = ({ children }) => {
  // 토큰 가져오기
  const getToken = () => {
    return localStorage.getItem('token');
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

  // 앱 시작 시 기존 토큰이 있으면 axios 헤더에 설정
  useEffect(() => {
    const existingToken = getToken();
    if (existingToken && isTokenValid()) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${existingToken}`;
    }
  }, []);

  // 토큰에서 사용자 정보 추출
  const getUserInfoFromToken = () => {
    const token = getToken();
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      
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
        // ✅ 필수 식별 정보
        userId: payload.userId || payload.sub,
        username: payload.username || payload.sub,
        
        // ✅ 필수 표시용 정보
        name: payload.name || payload.displayName || "사용자",
        email: payload.email || "",                          // 필수
        
        // ✅ 필수 권한 정보
        role: payload.role || "user",
        
        // ✅ 필수 JWT 표준 클레임
        sub: payload.sub,
        aud: payload.aud,
        iat: payload.iat,
        exp: payload.exp,
        
        // ✅ 필수 업무 정보
        operatorId: payload.operatorId || "UNKNOWN",         // 회사코드 (필수)
        
        // 🔸 선택적 정보
        authorities: payload.authorities || [],              // 세부 권한 (선택적)
        driverLicense: payload.driverLicense || null,        // 운전자 면허 (선택적)
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
    <TokenContext.Provider value={{ getToken, setToken, removeToken, isTokenValid, getUserInfoFromToken }}>
      {children}
    </TokenContext.Provider>
  );
};
