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
  const { getToken, getUserInfo, getUserInfoFromToken, isTokenValid } = useToken();
  const toast = useToast();

  // 연결 설정
  const connect = useCallback(() => {
    // 이미 연결되어 있으면 중복 연결 방지
    if (stompClient.current && stompClient.current.connected) {
      console.log("[WebSocket] 이미 연결되어 있음");
      return;
    }

    const token = getToken();
    const userInfo = getUserInfo();
    
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
    
    if (!userInfo) {
      console.log("[WebSocket] 사용자 정보가 없어 연결하지 않음");
      return;
    }

    console.log("[WebSocket] 연결 시작 - 토큰:", token ? "있음" : "없음");

    try {
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
      };

      // 연결 종료 시
      stompClient.current.onDisconnect = () => {
        console.log("[WebSocket] 연결 종료");
        setIsConnected(false);
      };

      // 연결 시작
      console.log("[WebSocket] STOMP 클라이언트 활성화 시도...");
      stompClient.current.activate();
      console.log("[WebSocket] STOMP 클라이언트 활성화 완료");

    } catch (error) {
      console.error("[WebSocket] 연결 설정 에러:", error);
      console.error("[WebSocket] 오류 상세:", error.message, error.stack);
      setIsConnected(false);
      toast.error(`WebSocket 연결 설정 실패: ${error.message}`);
    }
  }, []); // 의존성 제거하여 함수 재생성 방지

  // 연결 해제
  const disconnect = useCallback(() => {
    if (stompClient.current) {
      stompClient.current.deactivate();
      stompClient.current = null;
      setIsConnected(false);
      console.log("[WebSocket] 연결 해제 완료");
    }
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
        const token = getToken();
    const destination = `/topic/operator/1/warnings`;
    testSubscribe(destination);
  }, [getUserInfoFromToken, testSubscribe, toast]);

  // 불필요한 부가 기능 제거(알림/운전 이벤트 발행 등) — 최소 기능만 유지

  // 자동 연결 제거: 개발 단계에서는 수동 연결만 사용
  // 언마운트 시 연결 해제만 수행
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  // 자동 재연결/토큰 감지 로직 제거 — 수동 디버깅 모드 유지



  // Context value
  const value = {
    isConnected,
    notifications,
    sendMessage,
    sendTestMessage,
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