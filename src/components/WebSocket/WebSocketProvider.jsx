import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useToken } from "../Token/TokenProvider";
import { useToast } from "../Toast/ToastProvider";

const WebSocketContext = createContext(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const stompClient = useRef(null);
  const connectingRef = useRef(false); // 중복 activate 방지
  const retryRef = useRef({ attempts: 0, timer: null });
  const bootTimerRef = useRef(null); // StrictMode 1차 마운트 중 연결 지연/취소
  // 지속 구독 관리: destination -> subscription
  const subscriptionsRef = useRef(new Map());
  // 재연결 시 자동 복원을 위한 지속 구독 정의: destination -> { onMessage, headers }
  const persistentDefsRef = useRef(new Map());
  // 구독 실패 관리: destination -> { failCount: number, blocked: boolean, lastNotifiedAt?: number }
  const subscribeFailuresRef = useRef(new Map());
  // 중복 구독 시도 방지: destination -> boolean (attempt in-flight)
  const subscribeAttemptingRef = useRef(new Set());
  const [subscribedDestinations, setSubscribedDestinations] = useState([]);
  const { getToken, getUserInfo, getUserInfoFromToken, isTokenValid } = useToken();
  // 권한 실패 캐시 (destination -> timestamp) 재시도 폭주 방지
  const permissionDeniedRef = useRef(new Map());
  // 최근 access token refresh 타임스탬프 (TokenProvider에서 추후 노출 시 연동 예정)
  const lastRefreshRef = useRef(0); // placeholder: TokenProvider 확장 전까지 수동 사용
  const toast = useToast();

  // 구독 목록 상태를 안전하게 갱신 (실제 변화가 있을 때만)
  const setSubsState = (map) => {
    const arr = Array.from(map.keys());
    setSubscribedDestinations((prev) => {
      if (prev.length === arr.length && prev.every((v, i) => v === arr[i])) return prev;
      return arr;
    });
  };

  // 연결 설정
  const resolveWsHttpBase = () => {
    const envUrl = process.env.REACT_APP_WS_URL;
    if (envUrl) return envUrl.replace(/\/$/, '');
    // 로컬 개발 기본값: 백엔드 8080 추정
    const { protocol, hostname } = window.location;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    if (isLocal) return `${protocol}//localhost:8080`;
    // 배포 환경: 동일 오리진 사용
    return window.location.origin;
  };

  const connect = useCallback(() => {
    if (connectingRef.current) { console.log("[WebSocket] 이미 연결 시도 중"); return; }
    if (stompClient.current && stompClient.current.connected) { console.log("[WebSocket] 이미 연결되어 있음"); return; }

  const token = getToken(); // access token (legacy alias maintained)
    const userInfo = getUserInfo && getUserInfo();
    if (!token) { console.log("[WebSocket] 토큰이 없어 연결하지 않음"); return; }
    const valid = isTokenValid && isTokenValid();
    if (!valid) { console.warn("[WebSocket] 유효하지 않은 토큰"); return; }

    try {
      connectingRef.current = true;
      const baseHttp = resolveWsHttpBase();
  // 요구사항: CONNECT 시에만 헤더 검사 → URL query token 제거
  const sockUrl = `${baseHttp}/ws`;
      console.log("[WebSocket] 연결 시작:", sockUrl);
      const socket = new SockJS(sockUrl);

      stompClient.current = new Client({
        webSocketFactory: () => socket,
  connectHeaders: token ? { 'Authorization': `Bearer ${token}` } : {},
        debug: (str) => console.log('[STOMP Debug]', str),
        reconnectDelay: 0,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      stompClient.current.onConnect = (frame) => {
        console.log("[WebSocket] STOMP 연결 성공:", frame?.command);
        setIsConnected(true);
        connectingRef.current = false;
        try { if (retryRef.current.timer) clearTimeout(retryRef.current.timer); } catch {}
        retryRef.current.attempts = 0;
        // 지속 구독 복원 (receipt 기반 시도 + 3회 실패 시 차단)
        try {
          persistentDefsRef.current.forEach((def, dest) => {
            if (subscriptionsRef.current.has(dest)) return;
            const failureInfo = subscribeFailuresRef.current.get(dest);
            if (failureInfo?.blocked) {
              console.warn('[WebSocket] 차단된 구독 - 복원 건너뜀:', dest);
              return;
            }
            attemptSubscribe(dest, def.onMessage, def.headers);
          });
        } catch (e) {
          console.error('[WebSocket] 재구독 복원 오류', e);
        }
      };

      stompClient.current.onStompError = (frame) => {
        console.error("[WebSocket] STOMP 오류:", frame?.headers?.message, frame?.body);
        setIsConnected(false);
        connectingRef.current = false;
        const message = frame?.headers?.message || '알 수 없는 오류';
        if (message.includes('401') || frame?.body?.includes('Unauthorized')) {
          toast.error('실시간 연결 인증 실패 (401)');
        } else if (frame?.body?.includes('AccessDenied')) {
          toast.error('실시간 연결 권한 거부');
        } else {
          toast.error(`실시간 연결 실패: ${message}`);
        }
      };

      stompClient.current.onDisconnect = () => {
        console.log("[WebSocket] STOMP 연결 종료");
        setIsConnected(false);
        connectingRef.current = false;
      };

      stompClient.current.onWebSocketClose = (evt) => {
        console.warn("[WebSocket] 소켓 종료:", evt?.code, evt?.reason);
        setIsConnected(false);
        connectingRef.current = false;
      };

      console.log("[WebSocket] STOMP 활성화");
      stompClient.current.activate();
    } catch (error) {
      console.error("[WebSocket] 연결 설정 에러:", error);
      setIsConnected(false);
      connectingRef.current = false;
      toast.error(`WebSocket 연결 실패: ${error.message}`);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 연결 해제
  const disconnect = useCallback(() => {
    if (stompClient.current) {
      stompClient.current.deactivate();
      stompClient.current = null;
      try {
        // 모든 지속 구독 안전 해제
        subscriptionsRef.current.forEach((sub) => {
          try { sub.unsubscribe(); } catch (_) {}
        });
      } finally {
        subscriptionsRef.current.clear();
        setSubscribedDestinations([]);
      }
      setIsConnected(false);
      console.log("[WebSocket] 연결 해제 완료");
    }
    // 재시도 타이머 정리
    try { if (retryRef.current.timer) clearTimeout(retryRef.current.timer); } catch {}
    retryRef.current.attempts = 0;
  }, []);

  // 메시지 전송 함수
  const sendMessage = useCallback((destination, message) => {
    if (stompClient.current && isConnected) {
      try {
        stompClient.current.publish({
          destination: `/app${destination}`,
          body: JSON.stringify(message),
        });
        console.log("[WebSocket] 메시지 전송:", destination, message);
      } catch (error) {
        console.error("[WebSocket] 메시지 전송 에러:", error);
        toast.error("메시지 전송에 실패했습니다.");
      }
    } else {
      console.warn("[WebSocket] 연결되지 않아 메시지 전송 불가");
      toast.warning("실시간 연결이 끊어져 있습니다.");
    }
  }, [isConnected, toast]);

  // 지속 구독 시작 (해제 전까지 유지)
  const subscribePersistent = useCallback((destination, onMessage) => {
    if (!destination) return false;
    const failureInfo = subscribeFailuresRef.current.get(destination);
    if (failureInfo?.blocked) {
      toast.warning(`구독이 차단된 대상입니다(3회 실패): ${destination}`);
      return false;
    }
    // 이미 정의된 지속 구독이면 중복 방지
    if (persistentDefsRef.current.has(destination)) {
      // 이미 active
      if (subscriptionsRef.current.has(destination)) {
        // 조용히 성공 반환 (반복 호출 suppress)
        return true;
      }
      // 예약 상태 재호출: 불필요한 로그/토스트 억제
      if (!isConnected) {
        console.log('[WebSocket] 구독 이미 예약됨(중복 무시):', destination);
        connect();
      }
      return true; // onConnect에서 복원 예정
    }

  // 정책 변경: SUBSCRIBE 시 Authorization 헤더 제거 (CONNECT 검증에만 의존)
  const headers = {}; 

    // 연결이 아직 아니면: 정의를 저장해두고 onConnect에서 자동 복원
    if (!stompClient.current || !isConnected) {
      persistentDefsRef.current.set(destination, { onMessage, headers });
      // 예약 알림 과다 방지: 로그만 출력
      console.log('[WebSocket] 구독 예약(연결 후 복원):', destination);
      connect();
      return true;
    }

    // 즉시 구독 가능: receipt 기반 시도
    persistentDefsRef.current.set(destination, { onMessage, headers });
    attemptSubscribe(destination, onMessage, headers);
    return true;
  }, [isConnected, getToken, toast, connect]);

  // 지속 구독 해제
  const unsubscribePersistent = useCallback((destination) => {
    const sub = subscriptionsRef.current.get(destination);
    if (!sub) {
      // 활성 구독은 없지만 예약 정의만 존재할 수 있음 → 조용히 제거
      if (persistentDefsRef.current.has(destination)) {
        persistentDefsRef.current.delete(destination);
        subscribeFailuresRef.current.delete(destination);
        console.log('[WebSocket] 활성 구독 없음 - 예약 정의 제거:', destination);
        return true;
      }
      // 완전 미존재: 무시
      console.log('[WebSocket] 구독 해제 요청 대상 없음(무시):', destination);
      return false;
    }
    try {
      sub.unsubscribe();
      subscriptionsRef.current.delete(destination);
      persistentDefsRef.current.delete(destination);
      subscribeFailuresRef.current.delete(destination);
      setSubsState(subscriptionsRef.current);
      console.log('[WebSocket] 지속 구독 해제:', destination);
      // 과도한 toast 억제
      return true;
    } catch (error) {
      console.error('[WebSocket] 구독 해제 실패:', error);
      toast.error('구독 해제에 실패했습니다.');
      return false;
    }
  }, []);

  // 구독 수락 여부 테스트 (receipt 기반)
  const testSubscribe = useCallback(async (destination) => {
    if (!stompClient.current || !isConnected) {
      toast.warning("먼저 연결 버튼으로 STOMP에 연결해주세요.");
      return false;
    }
    try {
      const receiptId = `sub-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      let subscription = null;
      const result = await new Promise((resolve) => {
        let finished = false;
        const timeoutId = setTimeout(() => {
          if (finished) return;
          finished = true;
          // 권한 거부 또는 서버 미응답 가능
          if (subscription) {
            try { subscription.unsubscribe(); } catch (_) {}
          }
          resolve(false);
        }, 3000);

        // receipt 도착 시 성공으로 판단
        stompClient.current.watchForReceipt(receiptId, () => {
          if (finished) return;
          finished = true;
          clearTimeout(timeoutId);
          if (subscription) {
            try { subscription.unsubscribe(); } catch (_) {}
          }
          resolve(true);
        });

        // 실제 구독 시도 (콜백은 테스트 목적이라 no-op)
        try {
          // SUBSCRIBE 시에도 Authorization 헤더 첨부
          const token = getToken && getToken();
          subscription = stompClient.current.subscribe(
            destination,
            () => {},
            {
              receipt: receiptId,
              ...(token ? { Authorization: `Bearer ${token}` } : {})
            }
          );
        } catch (e) {
          if (finished) return;
          finished = true;
          clearTimeout(timeoutId);
          resolve(false);
        }
      });

      if (result) {
        toast.success(`구독 성공: ${destination}`);
      } else {
        toast.error(`구독 실패: ${destination} (권한 또는 서버 거부 가능)`);
      }
      return result;
    } catch (error) {
      console.error("[WebSocket] 구독 테스트 에러:", error);
      toast.error("구독 테스트 중 오류가 발생했습니다.");
      return false;
    }
  }, [isConnected, toast, getToken]);

  // operatorId 기반 구독 테스트: /topic/operator/{operatorId}/warnings
  const sendTestMessage = useCallback(() => {
    const destination = `/topic/operator/1/warnings`;
    // 테스트 버튼은 지속 구독을 시작하도록 변경
    subscribePersistent(destination);
  }, [subscribePersistent]);

  // 특정 배차의 실시간 위치 구독 (dispatchId별)
  const subscribeDispatchLocation = useCallback((dispatchId, onLocation) => {
    if (!dispatchId) return null;
    const destination = `/topic/dispatch/${dispatchId}/location`;
    // ROLE_DRIVER 권한 제한 (백엔드 로그 상 ADMIN 전용 토픽일 시 사전 차단)
    try {
      const info = getUserInfo && getUserInfo();
      if (info && Array.isArray(info.roles) && info.roles.includes('ROLE_DRIVER')) {
        console.warn('[WebSocket] DRIVER 권한으로 location 구독 차단:', destination);
        return () => {};
      }
    } catch {}
    // 메시지 파싱 및 콜백 전달
    const handler = (msg) => {
      try {
        const data = JSON.parse(msg.body);
        onLocation && onLocation(data);
      } catch (e) {
        console.error('[WebSocket] 위치 메시지 파싱 실패', e, msg);
      }
    };
    const ok = subscribePersistent(destination, handler);
    // 해제 함수 반환
    return () => unsubscribePersistent(destination);
  }, [subscribePersistent, unsubscribePersistent]);

  // 특정 배차 OBD 구독 (향후 1초 주기 또는 10초 주기 변경 가능, 메시지 스키마 미확정 방어 포함)
  const subscribeDispatchObd = useCallback((dispatchId, onObd) => {
    if (!dispatchId) return null;
    const destination = `/topic/dispatch/${dispatchId}/obd`;
    try {
      const info = getUserInfo && getUserInfo();
      if (info && Array.isArray(info.roles) && info.roles.includes('ROLE_DRIVER')) {
        console.warn('[WebSocket] DRIVER 권한으로 OBD 구독 차단:', destination);
        return () => {};
      }
    } catch {}
    const handler = (msg) => {
      try {
        const data = JSON.parse(msg.body);
        onObd && onObd(data);
      } catch (e) {
        console.error('[WebSocket] OBD 메시지 파싱 실패', e, msg);
      }
    };
    const ok = subscribePersistent(destination, handler);
    return () => unsubscribePersistent(destination);
  }, [subscribePersistent, unsubscribePersistent]);

  // 내부 유틸: 구독 시도(Receipt 기반) + 실패 카운트/차단 관리
  const attemptSubscribe = useCallback((destination, onMessage, headers = {}) => {
    if (!stompClient.current || !isConnected) return false;
    if (subscribeAttemptingRef.current.has(destination)) return false;
    const failureInfo = subscribeFailuresRef.current.get(destination);
    if (failureInfo?.blocked) {
      console.warn('[WebSocket] 차단된 구독 - 시도 건너뜀:', destination);
      return false;
    }
    // 최근 권한 실패 캐시 (30초 내 재시도 억제)
    const deniedAt = permissionDeniedRef.current.get(destination);
    if (deniedAt && Date.now() - deniedAt < 30_000) {
      console.warn('[WebSocket] 최근 권한 거부된 구독 - 재시도 지연:', destination);
      return false;
    }
    subscribeAttemptingRef.current.add(destination);

    try {
      // 실제 구독 시도 (receipt 의존 제거: 일부 브로커는 SUBSCRIBE에 대해 RECEIPT를 보내지 않음)
  const subHeaders = { ...(headers || {}) }; // 토큰 제외
      const subscription = stompClient.current.subscribe(
        destination,
        (message) => {
          try { onMessage?.(message); } catch (e) { console.error('[WebSocket] onMessage 처리 에러', e); }
        },
        subHeaders
      );

      // 성공으로 간주하고 상태 반영
      subscribeAttemptingRef.current.delete(destination);
      subscriptionsRef.current.set(destination, subscription);
      setSubsState(subscriptionsRef.current);
      subscribeFailuresRef.current.delete(destination);
      console.log('[WebSocket] 구독 시작:', destination);
      // 시스템 잦은 토픽(location/obd)은 toast 생략
      if (!/\/topic\/dispatch\/\d+\/(location|obd)/.test(destination)) {
        toast.success(`구독 시작: ${destination}`);
      }

      // 선택적: receipt 지원 브로커에서는 receipt를 요청해 로그만 남김
      try {
        const receiptId = `sub-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        stompClient.current.watchForReceipt?.(receiptId, () => {
          console.log('[WebSocket] 구독 receipt 수신:', destination);
        });
        // receipt를 별도 전송하려면 재구독이 필요하지만, 안정성을 위해 여기서는 생략
      } catch {}

      return true;
    } catch (e) {
      subscribeAttemptingRef.current.delete(destination);
      console.error('[WebSocket] 구독 시도 에러:', destination, e);
      // 권한 관련 메시지 탐지 시 캐시
      const msg = String(e?.message || e).toLowerCase();
      if (msg.includes('access') || msg.includes('denied') || msg.includes('unauthorized')) {
        permissionDeniedRef.current.set(destination, Date.now());
      }
      const info = subscribeFailuresRef.current.get(destination) || { failCount: 0, blocked: false };
      info.failCount += 1;
      if (info.failCount >= 3) {
        info.blocked = true;
        persistentDefsRef.current.delete(destination);
        toast.error(`구독 3회 연속 실패로 재시도를 중단합니다: ${destination}`);
      } else {
        toast.warning(`구독 실패(${info.failCount}/3): ${destination}`);
      }
      subscribeFailuresRef.current.set(destination, info);
      return false;
    }
  }, [isConnected, getToken, setSubsState]);

  // Context value
  const value = {
    isConnected,
    notifications,
    sendMessage,
    sendTestMessage,
    subscribePersistent,
    unsubscribePersistent,
    subscribedDestinations,
    testSubscribe,
    connect,
    disconnect,
    clearNotifications: () => setNotifications([]),
    subscribeDispatchLocation, // 추가됨
    subscribeDispatchObd,
  };

  // 토큰 변화 감지로 자동 연결 트리거: 이전 토큰과 현재 토큰을 비교하여, 새 토큰이 생기면 connect(), 토큰이 사라지면 disconnect().
  const prevTokenRef = useRef(null);
  useEffect(() => {
    const t = getToken && getToken();
    if (prevTokenRef.current !== t) {
      console.log('[WebSocket] 토큰 변경 감지:', t ? '존재' : '없음');
      prevTokenRef.current = t;
      if (t) {
        // 새 토큰 생김: 즉시 연결 시도
        if (!isConnected && !connectingRef.current) {
          console.log('[WebSocket] 토큰 준비됨 - 자동 연결 시도');
          connect();
        }
      } else {
        // 토큰 없음 감지 시 즉시 끊지 말고 200ms 후 재확인(로그인 직후 race 완화)
        setTimeout(() => {
          const recheck = getToken && getToken();
          if (!recheck && (stompClient.current || isConnected)) {
            console.log('[WebSocket] 토큰 제거 - 연결 해제(재확인)');
            disconnect();
          } else if (recheck && !isConnected && !connectingRef.current) {
            console.log('[WebSocket] 재확인 토큰 존재 - 지연 연결 시도');
            connect();
          }
        }, 200);
      }
    }
  }, [connect, disconnect, getToken, isConnected]);

  // (미래 확장) access token refresh 타임스탬프 기반 강제 재연결 훅 자리
  // ex) if (externallyProvidedLastRefresh > lastRefreshRef.current) { forceReconnect(); }

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};