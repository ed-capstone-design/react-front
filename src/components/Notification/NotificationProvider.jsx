import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
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
  const { subscribePersistent, isConnected, subscribedDestinations, testSubscribe } = useWebSocket();
  const didSubscribeRef = React.useRef(false);
  const toast = useToast();
  const didLogSubscribedRef = useRef(false);

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

  const handleRealtime = useCallback((payloadFrame) => {
    try {
      const rawRoot = typeof payloadFrame?.body === 'string' ? JSON.parse(payloadFrame.body) : payloadFrame;
      // 백엔드가 보낸 nested payload 병합
      const raw = rawRoot && rawRoot.payload ? { ...rawRoot, ...rawRoot.payload } : rawRoot;

      // createdAt 안전 파싱 (마이크로초 -> 밀리초로 truncate 시도)
      let createdAtDate;
      if (raw?.createdAt) {
        const truncated = raw.createdAt.replace(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3})(\d+)(Z|[+\-].*)?$/, '$1$3');
        createdAtDate = new Date(truncated || raw.createdAt);
      } else {
        createdAtDate = new Date();
      }

      // 토스트 정책 확장: WARNING, ALERT, DRIVING_WARNING
      const toastTypes = ['WARNING', 'ALERT', 'DRIVING_WARNING'];
      if (toastTypes.includes(raw?.notificationType)) {
        const isAlertish = raw.notificationType === 'ALERT';
        const isDrivingWarn = raw.notificationType === 'DRIVING_WARNING';
        const msg = raw?.message || (isAlertish ? '긴급 알림이 도착했습니다.' : isDrivingWarn ? '운행 경고가 도착했습니다.' : '경고 알림이 도착했습니다.');
        if (isAlertish) {
          toast.error(msg);
        } else {
          toast.warning(msg);
        }
      }

      // 콘솔 로깅
      try {
        console.log('[Notification][INCOMING]', {
          id: raw?.notificationId,
          type: raw?.notificationType,
          message: raw?.message,
          createdAt: raw?.createdAt,
          dispatchId: raw?.dispatchId,
          vehicleNumber: raw?.vehicleNumber,
          driverName: raw?.driverName,
          latitude: raw?.latitude,
          longitude: raw?.longitude,
          scheduledDepartureTime: raw?.scheduledDepartureTime,
        });
      } catch {}

      const incoming = {
        id: raw.notificationId,
        message: raw.message,
        type: raw.notificationType,
        url: raw.relatedUrl,
        createdAt: createdAtDate,
        dispatchId: raw.dispatchId ?? null,
        vehicleNumber: raw.vehicleNumber ?? null,
        driverName: raw.driverName ?? null,
        latitude: raw.latitude ?? null,
        longitude: raw.longitude ?? null,
        scheduledDepartureTime: raw.scheduledDepartureTime ? new Date(raw.scheduledDepartureTime) : null,
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
  }, [toast]);

  // 초기 로드: 토큰이 있을 때만 시도
  useEffect(() => {
    refresh();
  }, [refresh]);

  // 연결되었을 때 단 1회만 구독 (중복 방지)
  useEffect(() => {
    if (!isConnected) return;
    if (didSubscribeRef.current) return; // 이미 구독 완료
    const ok = subscribePersistent('/user/queue/notifications', handleRealtime);
    if (ok) didSubscribeRef.current = true;
    return () => {
      // 지속 구독은 Provider가 관리하므로 여기서는 해제 안 함
    };
  }, [isConnected, subscribePersistent, handleRealtime]);

  // 구독 로깅: (1) 낙관적 등록 로그 (2) receipt 기반 확정 로그 시도
  useEffect(() => {
    try {
      if (didLogSubscribedRef.current) return;
      if (Array.isArray(subscribedDestinations) && subscribedDestinations.includes('/user/queue/notifications')) {
        console.log('[Notification] 구독 핸들러 등록됨(낙관): /user/queue/notifications');
        didLogSubscribedRef.current = true;
        // 백그라운드로 receipt 기반 확정 검증 시도
        try {
          testSubscribe?.('/user/queue/notifications').then((ok) => {
            if (ok) {
              console.log('[Notification] 구독 확정 성공(receipt): /user/queue/notifications');
            } else {
              console.warn('[Notification] 구독 확정 실패/미확인(receipt 미지원 또는 거부): /user/queue/notifications');
            }
          }).catch(() => {
            console.warn('[Notification] 구독 확정 검증 중 오류 발생');
          });
        } catch {}
      }
    } catch {}
  }, [subscribedDestinations]);

  // 프론트 임의 알림 추가용 함수 (탭 간 동기화 제거)


  const value = { notifications, unreadCount, loading, error, refresh, markAsRead };
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
