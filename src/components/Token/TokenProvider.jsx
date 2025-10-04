import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

// 앱 시작 시점에 공용 baseURL을 즉시 설정 (초기 렌더 타이밍 경쟁 방지)
if (!axios.defaults.baseURL) {
  axios.defaults.baseURL = 'http://localhost:8080';
}

// 저장된 토큰이 있으면 즉시 Authorization 기본 헤더 세팅
try {
  const bootToken = localStorage.getItem('authToken');
  if (bootToken) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${bootToken}`;
  }
} catch {}

// 전역 요청/응답 인터셉터를 모듈 로드 시 한 번만 설치 (초기 요청도 커버)
if (!axios.__legacyRewriteInstalled) {
  axios.__legacyRewriteInstalled = true;
  axios.interceptors.request.use(
    (config) => {
      try {
        const method = (config.method || 'get').toLowerCase();
        const rawUrl = config.url || '';
        let pathname = rawUrl;
        try {
          const full = new URL(rawUrl, config.baseURL || axios.defaults.baseURL || window.location.origin);
          pathname = full.pathname.replace(/\/$/, '');
        } catch {
          pathname = String(rawUrl).replace(/\/$/, '');
        }

        if (method === 'get') {
          if (pathname === '/api/drivers') {
            config.url = '/api/admin/drivers';
          }
          if (pathname === '/api/notifications') {
            config.url = '/api/notifications/me';
          }
        }
      } catch {}

      const finalUrl = (() => {
        try {
          return new URL(config.url || '', config.baseURL || axios.defaults.baseURL || window.location.origin).toString();
        } catch {
          return String(config.url);
        }
      })();
      const debug = (() => {
        try { return !!localStorage.getItem('DEBUG_AXIOS'); } catch { return false; }
      })();
      if (debug) {
        console.log('📡 Axios 요청:', config.method?.toUpperCase(), finalUrl);
        console.log('📡 Authorization 헤더:', config.headers?.Authorization || '헤더 없음');
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      // React StrictMode의 이중 이펙트로 인해 첫 요청이 취소되며 발생하는 에러는 로그를 억제
      if (axios.isCancel?.(error) || error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError') {
        // console.debug('📡 Axios 요청 취소:', error.config?.url);
        return Promise.reject(error);
      }
      const finalUrl = (() => {
        try {
          return new URL(
            error.config?.url || '',
            error.config?.baseURL || axios.defaults.baseURL || window.location.origin
          ).toString();
        } catch {
          return String(error.config?.url);
        }
      })();
      const log = {
        url: finalUrl,
        status: error.response?.status,
        data: error.response?.data,
        code: error.code,
        message: error.message,
      };
      console.error('📡 Axios 응답 에러:', log);
      return Promise.reject(error);
    }
  );
}

const TokenContext = createContext({
  // 토큰 관련
  token: null,
  getToken: () => null,
  setToken: () => {},
  removeToken: () => {},
  isTokenValid: () => false,
  getUserInfoFromToken: () => null,
  // 사용자 정보 관리
  getUserInfo: () => null,
  setUserInfo: () => {},
  clearUserInfo: () => {},
  // 인증 관리
  login: () => {},
  logout: () => {},
});

export const useToken = () => useContext(TokenContext);

export const TokenProvider = ({ children }) => {
  // 사용자 정보 상태 관리
  const [userInfo, setUserInfoState] = useState(null);
  // 토큰을 state로 보관하여 setToken/removeToken 시 하위 컴포넌트 재렌더 유도
  const [tokenState, setTokenState] = useState(() => {
    try { return localStorage.getItem('authToken'); } catch { return null; }
  });



  // 컴포넌트 레벨에서는 별도 인터셉터 설정 불필요 (전역으로 이미 설치됨)

  // 토큰 가져오기 (간단하게)
  const getToken = () => {
    const token = localStorage.getItem('authToken'); // 하나의 키만 사용
    try {
      if (localStorage.getItem('DEBUG_AXIOS')) {
        console.log("🔑 [TokenProvider] 토큰 조회:", token ? `${token.substring(0, 20)}...` : '토큰 없음');
      }
    } catch {}
    return token;
  };

  // 사용자 정보 가져오기 (렌더링 중 상태 변경 방지)
  const getUserInfo = () => {
    if (userInfo) return userInfo;
    
    // 메모리에 없으면 localStorage에서 가져오기 (상태 업데이트 없이)
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      try {
        const parsed = JSON.parse(storedUserInfo);
        return parsed; // 상태 업데이트하지 않고 바로 반환
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

  // 토큰 저장 (간단하게)
  const setToken = (token) => {
    localStorage.setItem('authToken', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setTokenState(token);
  };

  // 토큰 삭제
  const removeToken = () => {
    localStorage.removeItem('authToken');
    delete axios.defaults.headers.common['Authorization'];
    setTokenState(null);
  };

  // 로그인 (토큰과 사용자 정보 함께 저장)
  const login = (loginResponse) => {
    console.log("🔐 로그인 응답 데이터:", loginResponse);
    
    // 백엔드 JwtResponseDto 구조에 맞춘 필드 추출
    const { token, userId, email, username, roles } = loginResponse;
    
    console.log("🔐 추출된 데이터:");
    console.log("- token:", token ? `${token.substring(0, 20)}...` : "없음");
    console.log("- userId:", userId);
    console.log("- email:", email);
    console.log("- username:", username);
    console.log("- roles:", roles);
    
    // 토큰 저장
    setToken(token);
    
    // 사용자 정보 저장 (백엔드 응답 구조에 맞춤)
    const userInfo = {
      userId,
      email,
      username,
      roles, // List<String> 형태로 받음
      loginTime: new Date().toISOString()
    };
    setUserInfo(userInfo);
    
    console.log("✅ 로그인 완료 - 저장된 사용자 정보:", userInfo);
    return userInfo;
  };

  // 로그아웃 (토큰과 사용자 정보 모두 삭제)
  const logout = () => {
    removeToken();
    clearUserInfo();
  };

    // 초기화: 기존 토큰 복원 및 axios 헤더 설정
  useEffect(() => {
    const existingToken = localStorage.getItem('authToken');
    console.log("🚀 [TokenProvider] 초기화 시작");
    
    if (existingToken) {
      console.log("✅ 기존 토큰 발견 - axios 헤더 설정");
      axios.defaults.headers.common['Authorization'] = `Bearer ${existingToken}`;
      if (tokenState !== existingToken) setTokenState(existingToken);
      
      // 사용자 정보도 복원
      const storedUserInfo = localStorage.getItem('userInfo');
      if (storedUserInfo) {
        try {
          const parsed = JSON.parse(storedUserInfo);
          setUserInfoState(parsed);
          console.log("✅ 사용자 정보 복원:", parsed.username);
        } catch (e) {
          console.error('사용자 정보 파싱 오류:', e);
          localStorage.removeItem('userInfo');
        }
      }
    } else {
      console.log("⚠️ 토큰 없음 - 로그인 필요");
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
      
      try {
        if (localStorage.getItem('DEBUG_AXIOS')) {
          console.log("🔍 JWT 페이로드 내용:", payload);
        }
      } catch {}
      
      // JWT 표준 클레임 검증
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < currentTime) {
        console.warn("토큰이 만료되었습니다.");
        return null;
      }
      
      // 백엔드 JWT 토큰 구조에 맞춘 사용자 정보 추출
      // JwtResponseDto: { token, userId, email, username, roles }
      // JWT 페이로드에는 보통 sub(subject), email, username 등이 포함됨
      return {
        userId: payload.userId || payload.sub, // 사용자 ID (주로 sub 클레임)
        username: payload.username || payload.preferred_username || payload.sub, // 사용자명
        email: payload.email || "", // 이메일
        roles: payload.roles || payload.authorities || payload.scope?.split(' ') || [], // 권한/역할
        // 운영사 식별자(백엔드에서 발급 시 사용) — 다양한 키 후보를 안전하게 병합
        operatorId: payload.operatorId || payload.operator_id || payload.operator?.id || null,
        // JWT 표준 클레임들
        sub: payload.sub, // Subject (사용자 식별자)
        aud: payload.aud, // Audience (토큰 대상)
        iat: payload.iat, // Issued At (발급 시간)
        exp: payload.exp, // Expiration Time (만료 시간)
        iss: payload.iss, // Issuer (발급자)
      };
    } catch (error) {
      console.error("토큰 파싱 실패:", error);
      return null;
    }
  };

  // 토큰 유효성 검사 (간단한 만료 확인만)
  const isTokenValid = () => {
    const token = getToken();
    if (!token) {
      console.log("🔍 토큰 유효성 검사: 토큰이 없음");
      return false;
    }
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      try {
        if (localStorage.getItem('DEBUG_AXIOS')) {
          console.log("🔍 토큰 유효성 검사:");
          console.log("- 현재 시간:", currentTime);
          console.log("- 토큰 만료 시간:", payload.exp);
          console.log("- 토큰 발급 시간:", payload.iat);
          console.log("- 토큰 대상자:", payload.aud);
          console.log("- 토큰 발급자:", payload.iss);
        }
      } catch {}
      
      // 만료 시간 확인
      if (payload.exp && payload.exp < currentTime) {
        console.log("❌ 토큰 만료됨");
        return false;
      }
      
      // 대상자 확인 (백엔드에서 설정한 값에 따라 조정 필요)
      // 임시로 주석 처리하여 백엔드 토큰 구조 확인
      // if (payload.aud && payload.aud !== "driving-app") {
      //   console.log("❌ 토큰 대상자 불일치");
      //   return false;
      // }
      
      // 발급 시간 확인 (미래 토큰 방지)
      if (payload.iat && payload.iat > currentTime + 300) {
        console.log("❌ 미래 토큰 감지");
        return false;
      }
      
      console.log("✅ 토큰 유효함");
      return true;
    } catch (error) {
      console.error("❌ 토큰 유효성 검사 실패:", error);
      return false;
    }
  };

  return (
    <TokenContext.Provider value={{ 
      // 토큰 값과 함수들
      token: tokenState,
      getToken, 
      setToken, 
      removeToken, 
      isTokenValid, 
      getUserInfoFromToken,
      // 사용자 정보 관리
      getUserInfo,
      setUserInfo,
      clearUserInfo,
      // 인증 관리
      login,
      logout
    }}>
      {children}
    </TokenContext.Provider>
  );
};
