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
  const [subscribedDestinations, setSubscribedDestinations] = useState([]);
  const { getToken, getUserInfo, getUserInfoFromToken, isTokenValid } = useToken();
  const toast = useToast();

  // 연결 설정
  const connect = useCallback(() => {
    // 이미 연결되어 있으면 중복 연결 방지
    if (connectingRef.current) {
      console.log("[WebSocket] 이미 연결 시도 중");
      return;
    }
    if (stompClient.current && stompClient.current.connected) {
      console.log("[WebSocket] 이미 연결되어 있음");
      return;
    }

    const token = getToken();
  const userInfo = getUserInfo && getUserInfo();
    
    if (!token) {
      console.log("[WebSocket] 토큰이 없어 연결하지 않음");
      return;
    }
    // 토큰 유효성 사전 검사 (만료/손상 토큰 차단)
    const valid = isTokenValid && isTokenValid();
    if (!valid) {
      console.warn("[WebSocket] 유효하지 않은 토큰으로 인해 연결 시도 중단 (만료 또는 파싱 실패)");
      return;
    }
    
    // userInfo는 선택 사항: 서버는 Authorization 토큰으로 인증하므로, 사용자 정보 복원 지연이 있어도 연결 시도

    console.log("[WebSocket] 연결 시작 - 토큰:", token ? "있음" : "없음");

    try {
      connectingRef.current = true;
      // SockJS로 WebSocket 연결 생성 (기본 엔드포인트, 토큰은 STOMP 연결 헤더로만 전달)
      const socket = new SockJS("http://localhost:8080/ws");
      console.log("[WebSocket] SockJS 소켓 생성됨 (토큰은 STOMP 연결 헤더로 전달)");
      
      // STOMP 클라이언트 설정
      stompClient.current = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
          // 서버에서 Authorization 헤더만 사용
          'Authorization': `Bearer ${token}`
        },
        debug: (str) => {
          console.log("[STOMP Debug]", str);
        },
        // 자동 재연결 비활성화: 단계별로 수동 연결만 사용
        reconnectDelay: 0,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });
      console.log("[WebSocket] STOMP CONNECT 헤더 점검 - Authorization 존재:", !!token, 
        "미리보기:", token ? `${token.substring(0, 10)}...` : "없음");

      // 연결 성공 시
      stompClient.current.onConnect = (frame) => {
        console.log("[WebSocket] STOMP 연결 성공:", frame);
        setIsConnected(true);
        connectingRef.current = false;
        // 연결 성공 시 재시도 타이머 초기화
        try { if (retryRef.current.timer) clearTimeout(retryRef.current.timer); } catch {}
        retryRef.current.attempts = 0;
        // 이미 등록된 지속 구독들을 자동 복원 (토스트 없이)
        try {
          persistentDefsRef.current.forEach((def, dest) => {
            try {
              if (subscriptionsRef.current.has(dest)) return; // 이미 살아있으면 스킵
              const sub = stompClient.current.subscribe(dest, (msg) => {
                try { def.onMessage?.(msg); } catch (e) { console.error('[WebSocket] onMessage 에러', e); }
              }, def.headers || {});
              subscriptionsRef.current.set(dest, sub);
            } catch (e) {
              console.error('[WebSocket] 재구독 실패:', dest, e);
            }
          });
          setSubscribedDestinations(Array.from(subscriptionsRef.current.keys()));
        } catch (e) {
          console.error('[WebSocket] 재구독 복원 중 오류', e);
        }
      };

      // 연결 실패 시
      stompClient.current.onStompError = (frame) => {
        console.error("[WebSocket] STOMP 연결 실패:", frame);
        console.error("[WebSocket] Error details:", frame.headers);
        console.error("[WebSocket] Error body:", frame.body);
        console.error("[WebSocket] Full frame object:", frame);
        console.error("[WebSocket] 사용된 토큰:", token ? `${token.substring(0, 20)}...` : "없음");
        console.error("[WebSocket] 사용자 정보:", userInfo);
        setIsConnected(false);
        
        // 401 오류 처리
        if (frame.headers?.message?.includes('401') || frame.body?.includes('Unauthorized') || frame.body?.includes('Full authentication')) {
          console.error("[WebSocket] 인증 실패 - 토큰 또는 백엔드 WebSocket 보안 설정 확인 필요");
          console.error("[WebSocket] 백엔드에서 WebSocket 인증을 위한 설정이 필요할 수 있습니다");
          toast.error("실시간 연결 인증 실패: 토큰 확인 또는 백엔드 설정 필요");
        } else {
          toast.error(`실시간 연결 실패: ${frame.headers?.message || '알 수 없는 오류'}`);
        }
        connectingRef.current = false;
        // 실패 시 재시도는 외부 효과에서 관리
      };

      // 연결 종료 시(명시적 DISCONNECT)
      stompClient.current.onDisconnect = () => {
        console.log("[WebSocket] 연결 종료");
        setIsConnected(false);
        connectingRef.current = false;
        // 재연결은 외부 효과에서 관리
      };

      // 네트워크 단절 등 소켓 닫힘
      stompClient.current.onWebSocketClose = (evt) => {
        console.warn("[WebSocket] 소켓이 닫혔습니다:", evt?.code, evt?.reason);
        setIsConnected(false);
        connectingRef.current = false;
        // 외부 effect가 재시도를 스케줄함
      };

      // 연결 시작
      console.log("[WebSocket] STOMP 클라이언트 활성화 시도...");
      stompClient.current.activate();
      console.log("[WebSocket] STOMP 클라이언트 활성화 완료");

    } catch (error) {
      console.error("[WebSocket] 연결 설정 에러:", error);
      console.error("[WebSocket] 오류 상세:", error.message, error.stack);
      setIsConnected(false);
      connectingRef.current = false;
      toast.error(`WebSocket 연결 설정 실패: ${error.message}`);
    }
  }, []); // 의존성 제거하여 함수 재생성 방지

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
          body: JSON.stringify(message)
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
    if (!stompClient.current || !isConnected) {
      toast.warning("먼저 연결 버튼으로 STOMP에 연결해주세요.");
      return false;
    }
    // 이미 지속 구독으로 등록되어 있다면, 활성 구독만 확인
    if (persistentDefsRef.current.has(destination)) {
      if (subscriptionsRef.current.has(destination)) {
        return true; // 이미 활성화된 구독
      }
      // 활성 구독이 끊겨 있다면(재연결 등), 조용히 복원
      try {
        const def = persistentDefsRef.current.get(destination);
        const sub = stompClient.current.subscribe(destination, (msg) => {
          try { def.onMessage?.(msg); } catch (e) { console.error('[WebSocket] onMessage 에러', e); }
        }, def.headers || {});
        subscriptionsRef.current.set(destination, sub);
        setSubscribedDestinations(Array.from(subscriptionsRef.current.keys()));
        return true;
      } catch (e) {
        console.error('[WebSocket] 구독 복원 실패:', e);
        toast.error('구독 복원 실패');
        return false;
      }
    }
    try {
      const token = getToken && getToken();
      const headers = { ...(token ? { Authorization: `Bearer ${token}` } : {}) };
      // 정의를 먼저 저장해 재연결 시 복원 가능하도록
      persistentDefsRef.current.set(destination, { onMessage, headers });
      const subscription = stompClient.current.subscribe(destination, (message) => {
        console.log("[WebSocket] 수신 메시지:", destination, message);
        if (typeof onMessage === 'function') {
          try { onMessage(message); } catch (e) { console.error("[WebSocket] onMessage 처리 에러", e); }
        }
      }, headers);
      subscriptionsRef.current.set(destination, subscription);
      setSubscribedDestinations(Array.from(subscriptionsRef.current.keys()));
      console.log("[WebSocket] 지속 구독 시작:", destination);
      toast.success(`구독 시작: ${destination}`);
      return true;
    } catch (error) {
      console.error("[WebSocket] 지속 구독 시작 실패:", error);
      toast.error("구독 시작에 실패했습니다.");
      return false;
    }
  }, [isConnected, getToken, toast]);

  // 지속 구독 해제
  const unsubscribePersistent = useCallback((destination) => {
    const sub = subscriptionsRef.current.get(destination);
    if (!sub) {
      toast.warning(`구독을 찾지 못했습니다: ${destination}`);
      return false;
    }
    try {
      sub.unsubscribe();
      subscriptionsRef.current.delete(destination);
      persistentDefsRef.current.delete(destination);
      setSubscribedDestinations(Array.from(subscriptionsRef.current.keys()));
      console.log("[WebSocket] 지속 구독 해제:", destination);
      toast.info(`구독 해제: ${destination}`);
      return true;
    } catch (error) {
      console.error("[WebSocket] 구독 해제 실패:", error);
      toast.error("구독 해제에 실패했습니다.");
      return false;
    }
  }, [toast]);

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

  // 불필요한 부가 기능 제거(알림/운전 이벤트 발행 등) — 최소 기능만 유지

  // 자동 연결 제거: 개발 단계에서는 수동 연결만 사용
  // 언마운트 시 연결 해제만 수행
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // 자동 재연결/토큰 감지 로직 제거 — 수동 디버깅 모드 유지
  // 토큰이 준비되면 자동 연결 + 지수 백오프로 재시도 (개발/실운영 모두 안전)
  useEffect(() => {
    const token = getToken && getToken();
    const valid = isTokenValid && isTokenValid();
    if (isConnected || connectingRef.current) return;

    // 토큰이 없거나 무효면 대기
    if (!token) {
      console.log("[WebSocket] 토큰 없음 - 연결 대기");
      return;
    }
    if (!valid) {
      console.log("[WebSocket] 무효 토큰 - 연결 대기");
      return;
    }

    // 개발 모드에서 StrictMode 이중 마운트를 흡수하기 위해 초기 연결을 약간 지연
    const initialDelay = process.env.NODE_ENV !== 'production' ? 150 : 0;
    const runInitial = () => {
      // 즉시 한 번 시도
      connect();

      // 백오프 재시도 스케줄링
      const maxAttempts = 5;
      const scheduleRetry = () => {
        if (isConnected || connectingRef.current) return;
        if (retryRef.current.attempts >= maxAttempts) return;
        const delay = Math.min(500 * Math.pow(2, retryRef.current.attempts), 8000);
        retryRef.current.attempts += 1;
        try { if (retryRef.current.timer) clearTimeout(retryRef.current.timer); } catch {}
        retryRef.current.timer = setTimeout(() => {
          console.log("[WebSocket] 자동 재시도:", retryRef.current.attempts, "회");
          connect();
          scheduleRetry();
        }, delay);
      };
      scheduleRetry();
    };

    if (initialDelay > 0) {
      bootTimerRef.current = setTimeout(runInitial, initialDelay);
    } else {
      runInitial();
    }

    return () => {
      try { if (retryRef.current.timer) clearTimeout(retryRef.current.timer); } catch {}
      try { if (bootTimerRef.current) clearTimeout(bootTimerRef.current); } catch {}
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);



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
    clearNotifications: () => setNotifications([])
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};