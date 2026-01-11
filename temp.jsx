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
} catch { }

// 저장된 accessToken이 있으면 기본 Authorization 세팅
try {
    const bootAccess = localStorage.getItem('accessToken');
    if (bootAccess) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${bootAccess}`;
    }
} catch { }

// 전역 요청/응답 인터셉터를 모듈 로드 시 한 번만 설치 (초기 요청도 커버)
if (!axios.__legacyRewriteInstalled) {
    axios.__legacyRewriteInstalled = true;
    axios.interceptors.request.use(
        (config) => {
            try {
                // 항상 최신 access token을 localStorage에서 읽어 Authorization 헤더로 설정
                const token = localStorage.getItem('accessToken') || localStorage.getItem('authToken');
                if (token) {
                    config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
                }

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
            } catch { }

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

    // 모듈 레벨 응답 인터셉터: 취소 에러는 통과, 401에 대해선 로그만 남기고
    // 실제 토큰 갱신/재시도 로직은 TokenProvider 내부의 인터셉터(useEffect)에서 처리합니다.
    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            if (axios.isCancel?.(error) || error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError') {
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
            // 401일 때 즉시 logout 하지 않음 — TokenProvider 내부에서 재시도 로직을 담당
            if (error.response?.status === 401) {
                console.warn('🚫 401 응답 수신(모듈 레벨) - TokenProvider에서 처리 예정', log.url);
            } else {
                console.error('📡 Axios 응답 에러:', log);
            }
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
    setTokens: () => { },
    clearTokens: () => { },
    refreshAccessToken: () => Promise.resolve(null),
    isAccessTokenValid: () => false,
    getUserInfoFromToken: () => null,
    // 토큰 갱신 이벤트
    onTokenRefresh: () => { },
    offTokenRefresh: () => { },
    // Backwards compatibility (legacy single token API)
    token: null,
    getToken: () => null,
    setToken: () => { },
    removeToken: () => { },
    isTokenValid: () => false,
    // 사용자 정보
    getUserInfo: () => null,
    setUserInfo: () => { },
    clearUserInfo: () => { },
    // 인증 제어
    login: () => { },
    logout: () => { },
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
        } catch { }
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

    // 로그아웃 (서버에 로그아웃 요청 후 토큰과 사용자 정보 삭제)
    const logout = async () => {
        try {
            const accessToken = getAccessToken();
            const refreshToken = getRefreshToken();

            if (accessToken) {
                console.log("🚪 서버에 로그아웃 요청 중...");

                // 서버에 로그아웃 요청
                const response = await axios.post('/api/auth/logout', {}, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    // 웹의 경우 쿠키도 함께 전송 (refresh_token 쿠키 자동 삭제를 위해)
                    withCredentials: true,
                    timeout: 5000
                });

                if (response.data?.success) {
                    console.log("✅ 서버 로그아웃 성공:", response.data.message);
                }
            }
        } catch (error) {
            // 서버 로그아웃 실패해도 로컬 토큰은 삭제 (보안상 중요)
            console.warn("⚠️ 서버 로그아웃 실패하지만 로컬 토큰 삭제 진행:", error.response?.data || error.message);
        } finally {
            // 항상 로컬 토큰과 사용자 정보 삭제
            clearTokens();
            clearUserInfo();
            console.log("🧹 로컬 토큰 및 사용자 정보 삭제 완료");
        }
    };

    // 초기화: 기존 토큰 복원 및 서버 검증
    useEffect(() => {
        const existingToken = localStorage.getItem('accessToken') || localStorage.getItem('authToken');
        console.log("🚀 [TokenProvider] 초기화 시작");

        if (existingToken) {
            console.log("✅ 기존 토큰 발견 - 서버 유효성 검증 시작");

            // 서버에서 토큰 유효성 검증 및 refresh token 상태 확인
            const verifyTokenWithServer = async () => {
                try {
                    // 임시로 axios 헤더 설정
                    axios.defaults.headers.common['Authorization'] = `Bearer ${existingToken}`;

                    // 1차: 기본 토큰 유효성 확인 (사용자 정보 조회)
                    const response = await axios.get('/api/users/me', {
                        timeout: 5000,
                        withCredentials: true // 쿠키와 함께 전송
                    });

                    if (response.status === 200) {
                        console.log("✅ 1차 토큰 유효성 확인됨 - refresh token 상태 검증 시작");

                        // 서버 세션 ID 확인(선택적) - 예전 로직 유지 자리에 자리만 남김
                        const storedServerId = localStorage.getItem('serverSessionId');
                        let currentServerId = null;
                        try {
                            // (추후 서버 상태 체크 로직 삽입 가능)
                        } catch (healthError) {
                            console.log("⚠️ 서버 상태 확인 실패 - refresh token 검증으로 진행");
                        }

                        // 3차: refresh token을 사용해서 새로운 access token 발급 시도
                        const refreshToken = getRefreshToken();
                        if (refreshToken) {
                            try {
                                const refreshResponse = await axios.post('/api/auth/refresh', { refreshToken }, {
                                    timeout: 5000,
                                    withCredentials: true,
                                    headers: { 'Content-Type': 'application/json' }
                                });

                                if (refreshResponse.status === 200 && refreshResponse.data?.success) {
                                    const newAccessToken = refreshResponse.data.data?.accessToken;
                                    if (newAccessToken && newAccessToken !== existingToken) {
                                        console.log("🔄 새로운 access token 발급됨 - 업데이트");
                                        setAccessTokenState(newAccessToken);
                                        localStorage.setItem('accessToken', newAccessToken);
                                        axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                                    } else {
                                        // 기존 토큰이 여전히 유효함
                                        console.log("✅ 기존 access token 여전히 유효");
                                        if (accessTokenState !== existingToken) setAccessTokenState(existingToken);
                                    }
                                }
                            } catch (refreshError) {
                                if (refreshError.response?.status === 401 || refreshError.response?.status === 403) {
                                    console.log("🚨 Refresh Token 무효화 감지 - 서버 재시작으로 인한 자동 로그인 차단");
                                    console.log("❌ 재로그인 필요 - 모든 토큰 삭제");
                                    clearTokens();
                                    clearUserInfo();
                                    localStorage.removeItem('serverSessionId');
                                    return;
                                } else {
                                    console.log("⚠️ Refresh 요청 실패 (네트워크 문제) - 기존 토큰 유지:", refreshError.code);
                                    if (accessTokenState !== existingToken) setAccessTokenState(existingToken);
                                }
                            }
                        } else {
                            console.log('⚠️ refreshToken 없음 - refresh 요청을 생략합니다');
                        }

                        // 사용자 정보 복원
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
                    }
                } catch (error) {
                    // 1차 토큰 검증에서 실패한 경우
                    if (error.response?.status === 401) {
                        console.log("❌ Access Token이 무효함 (401) - 토큰 삭제");
                        clearTokens();
                        clearUserInfo();
                    } else {
                        // 네트워크 에러나 서버 에러의 경우 토큰 유지하고 로컬에서만 복원
                        console.log("⚠️ 서버 연결 실패 - 토큰 유지하고 로컬 복원:", error.code || error.message);
                        if (accessTokenState !== existingToken) setAccessTokenState(existingToken);

                        // 사용자 정보 복원
                        const storedUserInfo = localStorage.getItem('userInfo');
                        if (storedUserInfo) {
                            try {
                                const parsed = JSON.parse(storedUserInfo);
                                setUserInfoState(parsed);
                                console.log("✅ 사용자 정보 로컬 복원:", parsed.username);
                            } catch (e) {
                                console.error('사용자 정보 파싱 오류:', e);
                                localStorage.removeItem('userInfo');
                            }
                        }
                    }
                }
            };

            verifyTokenWithServer();
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
            } catch { }

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

    // Access Token Refresh 로직 (서버 재시작 시 refresh token 무효화 감지 강화)
    const refreshAccessToken = async () => {
        if (refreshingRef.current) return refreshingRef.current; // 진행 중 Promise 재사용
        const refreshToken = getRefreshToken();
        const currentAccess = getAccessToken();
        if (!refreshToken) return null;

        const task = (async () => {
            try {
                console.log("🔄 Access Token 갱신 시도 중...");

                // 웹 환경에서는 쿠키 방식 우선 사용하되, 서버가 body의 refreshToken을 요구하면 함께 전송
                const resp = await axios.post('/api/auth/refresh', { refreshToken }, {
                    headers: currentAccess ? { 'Authorization': `Bearer ${currentAccess}` } : {},
                    withCredentials: true, // refresh_token 쿠키 사용
                    timeout: 5000
                });

                // AccessTokenResponse 구조: { accessToken }
                const responseData = resp.data?.data || resp.data;
                const newAccess = responseData?.accessToken;

                if (newAccess) {
                    setTokens({ accessToken: newAccess, refreshToken });
                    console.log('✅ Access Token 재발급 성공');
                    notifyTokenRefresh(newAccess);
                    return newAccess;
                }
                return null;
            } catch (e) {
                const status = e.response?.status;
                const errorData = e.response?.data;

                // 서버 재시작이나 refresh token 무효화 감지
                if (status === 401 || status === 403) {
                    console.log("🚨 Refresh Token 무효화 감지:", {
                        status,
                        message: errorData?.message,
                        error: errorData?.error
                    });

                    // 특정 에러 메시지로 서버 재시작 감지
                    const errorMessage = (errorData?.message || errorData?.error || '').toLowerCase();
                    if (errorMessage.includes('invalid') ||
                        errorMessage.includes('expired') ||
                        errorMessage.includes('not found') ||
                        status === 401) {
                        console.log("❌ 서버 재시작으로 인한 Refresh Token 무효화 - 강제 로그아웃");

                        // 모든 토큰과 사용자 정보 삭제
                        setTimeout(() => {
                            clearTokens();
                            clearUserInfo();

                            // 현재 페이지가 로그인 페이지가 아니면 로그인 페이지로 이동
                            if (window.location.pathname !== '/signin' && window.location.pathname !== '/signup') {
                                window.location.href = '/signin';
                            }
                        }, 100);
                    }
                } else {
                    console.warn('[TokenProvider] refresh 네트워크 실패:', e.code || e.message);
                }
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

    // 응답 인터셉터에 refresh 로직 및 서버 재시작 감지 강화
    useEffect(() => {
        // single-flight 및 pending queue
        let isRefreshing = false;
        let pendingQueue = [];

        const processQueue = (error, token = null) => {
            pendingQueue.forEach(prom => {
                if (error) prom.reject(error);
                else prom.resolve(token);
            });
            pendingQueue = [];
        };

        const id = axios.interceptors.response.use(
            (res) => res,
            async (error) => {
                try {
                    const status = error?.response?.status;
                    const url = error?.config?.url || '';

                    // refresh API 자체의 401/403 에러는 서버 재시작 또는 refresh token 무효화
                    if ((status === 401 || status === 403) && url.includes('/api/auth/refresh')) {
                        console.log("🚨 Refresh API에서 401/403 - 서버 재시작 감지, 강제 로그아웃");
                        clearTokens();
                        clearUserInfo();
                        setTimeout(() => {
                            if (window.location.pathname !== '/signin' && window.location.pathname !== '/signup') {
                                window.location.href = '/signin';
                            }
                        }, 100);
                        return Promise.reject(error);
                    }

                    // 401이면 refresh 흐름 시도
                    if (status === 401 && !url.includes('/api/auth/refresh')) {
                        const originalRequest = error.config;

                        // 이미 재시도된 요청인지 확인
                        if (originalRequest._retry) {
                            return Promise.reject(error);
                        }
                        originalRequest._retry = true;

                        if (isRefreshing) {
                            // refresh가 진행 중이면 대기 큐에 넣고 토큰이 발급되면 재시도
                            return new Promise((resolve, reject) => {
                                pendingQueue.push({
                                    resolve: (token) => {
                                        originalRequest.headers = { ...(originalRequest.headers || {}), Authorization: `Bearer ${token}` };
                                        resolve(axios(originalRequest));
                                    }, reject
                                });
                            });
                        }

                        isRefreshing = true;
                        try {
                            const newToken = await refreshAccessToken();
                            if (newToken) {
                                processQueue(null, newToken);
                                originalRequest.headers = { ...(originalRequest.headers || {}), Authorization: `Bearer ${newToken}` };
                                return axios(originalRequest);
                            } else {
                                const err = new Error('refresh_failed');
                                processQueue(err, null);
                                clearTokens();
                                clearUserInfo();
                                setTimeout(() => {
                                    if (window.location.pathname !== '/signin' && window.location.pathname !== '/signup') {
                                        window.location.href = '/signin';
                                    }
                                }, 100);
                                return Promise.reject(error);
                            }
                        } finally {
                            isRefreshing = false;
                        }
                    }
                } catch (e) {
                    console.warn('[TokenProvider] refresh 처리 중 예외', e);
                }
                return Promise.reject(error);
            }
        );
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