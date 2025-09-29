import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import axios from "axios";

// baseURL은 TokenProvider에서 중앙 설정합니다.

const NotificationCountContext = createContext();

export const useNotificationCount = () => {
  const context = useContext(NotificationCountContext);
  if (!context) {
    throw new Error("useNotificationCount must be used within a NotificationCountProvider");
  }
  return context;
};

export const NotificationCountProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // 읽지 않은 알림 목록을 가져와서 개수 계산 - 주석처리 (백엔드 미구현)
  /*
  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get("/api/notifications/me/unread");
      // 프론트에서 개수 계산
      setUnreadCount(response.data.length || 0);
    } catch (error) {
      console.log("읽지 않은 알림 조회 실패:", error.message);
      
      // CORS 에러 또는 네트워크 에러 처리
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        console.log("🚨 백엔드 서버 연결 실패 - 알림 기능 비활성화");
      }
      
      console.log("기본값 0으로 설정");
      setUnreadCount(0);
    }
  };
  */

  // WebSocket 연결 (주석 처리 - 아직 백엔드 개발 미완료)
  const connectWebSocket = () => {
    // TODO: 백엔드 WebSocket 엔드포인트 완성 후 주석 해제
    /*
    try {
      const ws = new WebSocket('ws://localhost:8080/notifications');
      
      ws.onopen = () => {
        console.log('알림 WebSocket 연결됨');
        setWsConnected(true);
        reconnectAttempts.current = 0;
      };

      ws.onclose = () => {
        console.log('알림 WebSocket 연결 해제됨');
        setWsConnected(false);
        wsRef.current = null;
        
        // 자동 재연결 (최대 시도 횟수 제한)
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000); // 지수적 백오프, 최대 30초
          console.log(`${delay}ms 후 재연결 시도...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connectWebSocket();
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('알림 WebSocket 에러:', error);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          switch (message.type) {
            case 'NEW_NOTIFICATION':
              setUnreadCount(prev => prev + 1);
              break;
              
            case 'NOTIFICATION_READ':
              setUnreadCount(prev => Math.max(0, prev - 1));
              break;
              
            case 'BULK_READ':
              setUnreadCount(0);
              break;
              
            case 'NOTIFICATION_COUNT_UPDATE':
              setUnreadCount(message.count || 0);
              break;
              
            default:
              console.log('알 수 없는 알림 메시지 타입:', message.type);
          }
        } catch (error) {
          console.error('알림 메시지 파싱 실패:', error);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('WebSocket 연결 실패:', error);
    }
    */
    console.log('WebSocket 연결 건너뜀 (백엔드 개발 미완료)');
  };

  // 초기화
  useEffect(() => {
    // 초기 읽지 않은 알림 수 로드 - 주석처리 (백엔드 미구현)
    // fetchUnreadCount();
    
    // 임시로 기본값 0 설정
    setUnreadCount(0);
    
    // WebSocket 연결 (주석 처리 - 백엔드 개발 미완료)
    // connectWebSocket();
    
    // 정리 함수
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // 알림 읽음 처리
  const markAsRead = async (dispatchId) => {
    // try {
    //   await axios.put(`/api/notifications/me/${dispatchId}`);
    //   setUnreadCount(prev => Math.max(0, prev - 1));
    // } catch (error) {
    //   console.error('알림 읽음 처리 실패:', error);
    //   // WebSocket으로 받은 업데이트가 있을 수 있으니 전체 카운트 재조회
    //   fetchUnreadCount();
    // }
  };


  // 수동 새로고침
  const refreshCount = () => {
    // fetchUnreadCount();
  };

  const value = {
    unreadCount,
    wsConnected,
    markAsRead,
    refreshCount
  };

  return (
    <NotificationCountContext.Provider value={value}>
      {children}
    </NotificationCountContext.Provider>
  );
};