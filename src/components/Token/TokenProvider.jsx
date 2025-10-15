import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';

// 앱 시작 시점에 공용 baseURL을 즉시 설정 (초기 렌더 타이밍 경쟁 방지)
if (!axios.defaults.baseURL) {
  axios.defaults.baseURL = 'http://localhost:8080';
}

// 초기 마이그레이션: 기존 단일 authToken → access/refresh 분리
try {
  const legacy = localStorage.getItem('authToken');
  const existingAccess = localStorage.getItem('accessToken');
  if (legacy && !existingAccess) {
    localStorage.setItem('accessToken', legacy);
    // refreshToken 은 없으므로 로그인 재시도 시 발급받도록.
  }
} catch {}

// 저장된 accessToken이 있으면 기본 Authorization 세팅
try {
  const bootAccess = localStorage.getItem('accessToken');
  if (bootAccess) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${bootAccess}`;
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
      
      // 401 Unauthorized 에러 처리 - 토큰 만료 시 자동 로그아웃
      if (error.response?.status === 401) {
        console.warn('🚫 401 Unauthorized 감지 - 자동 로그아웃 처리');
        try {
          // 토큰 및 사용자 정보 삭제
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('authToken'); // legacy
          localStorage.removeItem('userInfo');
          
          // axios 기본 헤더에서 Authorization 제거
          delete axios.defaults.headers.common['Authorization'];
          
          // 로그인 페이지로 리다이렉트 (현재 페이지가 아닌 경우에만)
          if (window.location.pathname !== '/signin' && window.location.pathname !== '/auth') {
            window.location.href = '/signin';
          }
        } catch (e) {
          console.error('자동 로그아웃 처리 중 오류:', e);
        }
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
  // Access/Refresh
  accessToken: null,
  refreshToken: null,
  getAccessToken: () => null,
  getRefreshToken: () => null,
  setTokens: () => {},
  clearTokens: () => {},
  refreshAccessToken: () => Promise.resolve(null),
  isAccessTokenValid: () => false,
  getUserInfoFromToken: () => null,
  // 토큰 갱신 이벤트
  onTokenRefresh: () => {},
  offTokenRefresh: () => {},
  // Backwards compatibility (legacy single token API)
  token: null,
  getToken: () => null,
  setToken: () => {},
  removeToken: () => {},
  isTokenValid: () => false,
  // 사용자 정보
  getUserInfo: () => null,
  setUserInfo: () => {},
  clearUserInfo: () => {},
  // 인증 제어
  login: () => {},
  logout: () => {},
});

export const useToken = () => useContext(TokenContext);

export const TokenProvider = ({ children }) => {
  // 사용자 정보 상태 관리
  const [userInfo, setUserInfoState] = useState(null);
  // Access / Refresh token state
  const [accessTokenState, setAccessTokenState] = useState(() => {
    try { return localStorage.getItem('accessToken') || localStorage.getItem('authToken'); } catch { return null; }
  });
  const [refreshTokenState, setRefreshTokenState] = useState(() => {
    try { return localStorage.getItem('refreshToken'); } catch { return null; }
  });
  const refreshingRef = useRef(null); // Promise 중복 방지
  // 토큰 갱신 이벤트 리스너 관리
  const tokenRefreshListenersRef = useRef(new Set());

  // 컴포넌트 레벨에서는 별도 인터셉터 설정 불필요 (전역으로 이미 설치됨)

  // 토큰 가져오기 (간단하게)
  const getAccessToken = () => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken');
    try {
      if (localStorage.getItem('DEBUG_AXIOS')) {
        console.log("🔑 [TokenProvider] 토큰 조회:", token ? `${token.substring(0, 20)}...` : '토큰 없음');
      }
    } catch {}
    return token;
  };

  const getRefreshToken = () => {
    try { return localStorage.getItem('refreshToken'); } catch { return null; }
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

  // 토큰 갱신 이벤트 리스너 관리
  const onTokenRefresh = useCallback((callback) => {
    if (typeof callback === 'function') {
      tokenRefreshListenersRef.current.add(callback);
    }
    return () => tokenRefreshListenersRef.current.delete(callback);
  }, []);

  const offTokenRefresh = useCallback((callback) => {
    tokenRefreshListenersRef.current.delete(callback);
  }, []);

  // 토큰 갱신 이벤트 발생
  const notifyTokenRefresh = useCallback((newAccessToken) => {
    tokenRefreshListenersRef.current.forEach(callback => {
      try {
        callback(newAccessToken);
      } catch (e) {
        console.error('[TokenProvider] 토큰 갱신 이벤트 콜백 오류:', e);
      }
    });
  }, []);

  // 토큰 저장 (간단하게)
  const setTokens = ({ accessToken, refreshToken }) => {
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      setAccessTokenState(accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
      setRefreshTokenState(refreshToken);
    }
  };

  // Legacy setter (maps to accessToken only)
  const setToken = (token) => setTokens({ accessToken: token });

  // 토큰 삭제
  const clearTokens = () => {
    localStorage.removeItem('authToken'); // legacy
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    delete axios.defaults.headers.common['Authorization'];
    setAccessTokenState(null);
    setRefreshTokenState(null);
  };

  const removeToken = clearTokens; // backward compatibility

  // 로그인 (토큰과 사용자 정보 함께 저장)
  const login = (loginResponse = {}) => {
    console.log("🔐 로그인 응답 데이터:", loginResponse);
    // 지원하는 필드: accessToken / refreshToken / token(legacy)
    const accessToken = loginResponse.accessToken || loginResponse.token || null;
    const refreshToken = loginResponse.refreshToken || null;
    const { userId, email, username, roles } = loginResponse;
    setTokens({ accessToken, refreshToken });
    const userInfo = {
      userId,
      email,
      username,
      roles,
      loginTime: new Date().toISOString()
    };
    setUserInfo(userInfo);
    console.log("✅ 로그인 완료 - 저장된 사용자 정보:", userInfo);
    return userInfo;
  };

  // 로그아웃 (토큰과 사용자 정보 모두 삭제)
  const logout = () => {
    clearTokens();
    clearUserInfo();
  };

    // 초기화: 기존 토큰 복원 및 axios 헤더 설정
  useEffect(() => {
  const existingToken = localStorage.getItem('accessToken') || localStorage.getItem('authToken');
    console.log("🚀 [TokenProvider] 초기화 시작");
    
    if (existingToken) {
      console.log("✅ 기존 토큰 발견 - axios 헤더 설정");
  axios.defaults.headers.common['Authorization'] = `Bearer ${existingToken}`;
  if (accessTokenState !== existingToken) setAccessTokenState(existingToken);
      
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
    const token = getAccessToken();
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

  // 토큰 유효성 검사 (base64url 디코딩 오류 방지 + 만료/기본 무결성만 확인)
  const isAccessTokenValid = () => {
    const token = getAccessToken();
    if (!token) {
      if (localStorage.getItem('DEBUG_AXIOS')) {
        console.log('🔍 토큰 유효성 검사: 토큰 없음');
      }
      return false;
    }
    const parts = token.split('.');
    if (parts.length < 2) {
      if (localStorage.getItem('DEBUG_AXIOS')) console.log('❌ 토큰 구조 비정상 (parts < 2)');
      return false;
    }
    try {
      // base64url → base64 변환
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(base64Url.length / 4) * 4, '=');
      const json = atob(base64);
      const payload = JSON.parse(json);
      const now = Math.floor(Date.now() / 1000);

      if (payload.exp && payload.exp < now) {
        if (localStorage.getItem('DEBUG_AXIOS')) console.log('❌ 토큰 만료(exp < now)', payload.exp, now);
        return false;
      }
      if (payload.iat && payload.iat > now + 300) { // 미래 발급 방지 (허용 오차 5분)
        if (localStorage.getItem('DEBUG_AXIOS')) console.log('❌ 미래 발급 토큰(iat > now+5m)', payload.iat, now);
        return false;
      }
      if (localStorage.getItem('DEBUG_AXIOS')) {
        console.log('✅ Access 토큰 유효', { exp: payload.exp, iat: payload.iat, aud: payload.aud, iss: payload.iss });
      }
      return true;
    } catch (e) {
      if (localStorage.getItem('DEBUG_AXIOS')) console.log('❌ 토큰 디코딩 실패', e);
      return false;
    }
  };

  // Legacy alias
  const isTokenValid = isAccessTokenValid;

  // Access Token Refresh 로직 (백엔드 명세 적용: 웹=쿠키, 앱=body, Authorization 헤더)
  const refreshAccessToken = async () => {
    if (refreshingRef.current) return refreshingRef.current; // 진행 중 Promise 재사용
    const refreshToken = getRefreshToken();
    const currentAccess = getAccessToken();
    if (!refreshToken) return null;
    
    const task = (async () => {
      try {
        // 백엔드 명세: Authorization Bearer <Access_Token> + 쿠키/body 방식
        const headers = {};
        if (currentAccess) {
          headers['Authorization'] = `Bearer ${currentAccess}`;
        }
        
        // 웹: 쿠키 우선, 앱: body fallback (현재는 앱 방식만 구현)
        // TODO: 웹 환경에서는 withCredentials: true + 쿠키 의존 방식으로 확장 가능
        const resp = await axios.post('/api/auth/refresh', 
          { refreshToken }, 
          { headers }
        );
        
        // AccessTokenResponse 구조: { accessToken }
        const responseData = resp.data?.data || resp.data; // ApiResponse 언래핑
        const newAccess = responseData?.accessToken;
        
        if (newAccess) {
          // refresh token은 회전하지 않는다고 가정 (백엔드 명세 기준)
          setTokens({ accessToken: newAccess, refreshToken });
          console.log('🔄 Access Token 재발급 성공');
          // 토큰 갱신 이벤트 발생
          notifyTokenRefresh(newAccess);
          return newAccess;
        }
        return null;
      } catch (e) {
        console.warn('[TokenProvider] refresh 실패, 로그아웃 필요 가능성', e);
        return null;
      } finally {
        refreshingRef.current = null;
      }
    })();
    refreshingRef.current = task;
    return task;
  };

  // 401 처리용 보조 플래그
  const isRefreshingError = (error) => {
    // 서버 에러 구조 확정 시 code/message 기반 정밀 분기
    const status = error?.response?.status;
    if (status !== 401) return false;
    const msg = (error?.response?.data?.error || error?.response?.data?.message || '').toLowerCase();
    // 예: access token 만료 문구 탐지
    return msg.includes('expired') || msg.includes('access');
  };

  // 응답 인터셉터에 refresh 로직 주입 (이미 전역 인터셉터 존재 → 추가 체인)
  useEffect(() => {
    const id = axios.interceptors.response.use(r => r, async (error) => {
      try {
        if (isRefreshingError(error)) {
          const newToken = await refreshAccessToken();
            if (newToken) {
              // 원 요청 재시도
              const cfg = { ...error.config };
              cfg.headers = { ...(cfg.headers || {}), Authorization: `Bearer ${newToken}` };
              return axios(cfg);
            }
        }
      } catch (e) {
        console.warn('[TokenProvider] refresh 처리 중 예외', e);
      }
      return Promise.reject(error);
    });
    return () => axios.interceptors.response.eject(id);
  }, []);

  return (
    <TokenContext.Provider value={{
      accessToken: accessTokenState,
      refreshToken: refreshTokenState,
      getAccessToken,
      getRefreshToken,
      setTokens,
      clearTokens,
      refreshAccessToken,
      isAccessTokenValid,
      // 토큰 갱신 이벤트
      onTokenRefresh,
      offTokenRefresh,
      // legacy aliases
      token: accessTokenState,
      getToken: getAccessToken,
      setToken,
      removeToken: clearTokens,
      isTokenValid,
      // user
      getUserInfo,
      setUserInfo,
      clearUserInfo,
      // auth control
      login,
      logout,
      getUserInfoFromToken,
    }}>
      {children}
    </TokenContext.Provider>
  );
};
