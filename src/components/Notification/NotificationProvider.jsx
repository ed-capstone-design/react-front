import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getMyNotifications, markAsRead as markAsReadApi } from '../../api/notifications';
import { useToken } from '../Token/TokenProvider';
import { useWebSocket } from '../WebSocket/WebSocketProvider';
import { useToast } from '../Toast/ToastProvider';

const NotificationContext = createContext(null);

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getToken } = useToken();
  const { subscribePersistent, isConnected } = useWebSocket();
  const didSubscribeRef = React.useRef(false);
  const toast = useToast();

  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken?.();
      // 토큰이 없으면 조회 시도하지 않음(로그인 페이지 등)
      if (!token) {
        setNotifications([]);
        return;
      }
      const list = await getMyNotifications(token);
      setNotifications(list);
    } catch (e) {
      console.error('[Notification] 목록 조회 실패', e);
      setError(e);
      // 인증 실패(401)는 로그인 흐름일 수 있으니 사용자 토스트는 생략
      const status = e?.response?.status;
      if (status !== 401) {
        toast.error('알림 목록을 불러오지 못했습니다.');
      }
    } finally {
      setLoading(false);
    }
  }, [getToken, toast]);

  const markAsRead = useCallback(async (id) => {
    // 낙관적 업데이트
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      const token = getToken?.();
      await markAsReadApi(id, token);
    } catch (e) {
      console.error('[Notification] 읽음 처리 실패', e);
      // 롤백 대신 전체 동기화
      refresh();
    }
  }, [getToken, refresh]);

  const handleRealtime = useCallback((payload) => {
    try {
      const raw = typeof payload?.body === 'string' ? JSON.parse(payload.body) : payload;
      const incoming = {
        id: raw.notificationId,
        message: raw.message,
        type: raw.notificationType,
        url: raw.relatedUrl,
        createdAt: new Date(raw.createdAt),
        dispatchId: raw.dispatchId ?? null,
        vehicleNumber: raw.vehicleNumber ?? null,
        driverName: raw.driverName ?? null,
        isRead: !!raw.isRead,
      };
      setNotifications(prev => {
        const map = new Map(prev.map(n => [n.id, n]));
        const existed = map.get(incoming.id);
        const merged = existed ? {
          ...existed,
          ...incoming,
          isRead: existed.isRead || incoming.isRead,
          createdAt: new Date(Math.max(existed.createdAt, incoming.createdAt)),
        } : incoming;
        map.set(merged.id, merged);
        return Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt).slice(0, 1000);
      });
    } catch (e) {
      console.error('[Notification] 실시간 메시지 처리 실패', e);
    }
  }, []);

  // 초기 로드: 토큰이 있을 때만 시도
  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!isConnected) return;
    // 연결이 켜질 때마다 안전하게 재시도 (WebSocketProvider가 중복 활성화를 방지)
    const ok = subscribePersistent('/user/queue/notifications', handleRealtime);
    if (ok) didSubscribeRef.current = true;
    return () => {
      // 구독 해제는 WebSocketProvider에서 관리됨(지속 구독), 여기서는 no-op
    };
  }, [isConnected, subscribePersistent, handleRealtime]);

  const value = { notifications, unreadCount, loading, error, refresh, markAsRead };
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
