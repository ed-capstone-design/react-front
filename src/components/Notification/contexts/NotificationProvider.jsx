import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getMyNotifications, getMyUnreadNotifications, markAsRead as markAsReadApi } from '../../../api/notifications';
import dayjs from 'dayjs';
import { useToken } from '../../Token/TokenProvider';
import { useWebSocket } from '../../WebSocket/WebSocketProvider';
import { useToast } from '../../Toast/ToastProvider';

const NotificationContext = createContext(null);

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [version, setVersion] = useState(0); // 재렌더 트리거 용 카운터
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // token 값 자체를 구독해야 로그인 직후(effect 재실행) 초기 전체 fetch 가 동작함
  const { getToken, token, onTokenRefresh } = useToken();
  const { subscribePersistent, isConnected, subscribedDestinations } = useWebSocket();
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
        return [];
      }
      try { console.debug('[Notification] refresh start, tokenPreview:', token ? `${token.substring(0,10)}...` : null); } catch {}
      const list = await getMyUnreadNotifications(token);
      const onlyUnread = Array.isArray(list) ? list.filter(n => !n.isRead) : [];
      setNotifications(onlyUnread);
      try { console.log('[Notification] refresh -> unread count', onlyUnread.length, onlyUnread.map(x=>x.id)); } catch {}
      return onlyUnread;
    } catch (e) {
      console.error('[Notification] 목록 조회 실패', e);
      setError(e);
      // 인증 실패(401)는 로그인 흐름일 수 있으니 사용자 토스트는 생략
      const status = e?.response?.status;
      if (status !== 401) {
        toast.error('알림 목록을 불러오지 못했습니다.');
      }
      return [];
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
      // 성공적으로 읽음 처리되면 전체 알림(미읽음) 목록을 다시 동기화
      await refresh();
      return true;
    } catch (e) {
      console.error('[Notification] 읽음 처리 실패', e);
      // 롤백 대신 전체 동기화
      await refresh();
      return false;
    }
  }, [getToken, refresh]);

  const handleRealtime = useCallback((payloadFrame) => {
    try {
      const rawRoot = typeof payloadFrame?.body === 'string' ? JSON.parse(payloadFrame.body) : payloadFrame;
      // 백엔드가 보낸 nested payload 병합
      const raw = rawRoot && rawRoot.payload ? { ...rawRoot, ...rawRoot.payload } : rawRoot;

      // createdAt 안전 파싱 (마이크로초 -> 밀리초로 truncate 시도) -> normalize to ISO string via dayjs
      let createdAtIso;
      if (raw?.createdAt) {
        try {
          const truncated = String(raw.createdAt).replace(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3})(\d+)(Z|[+\-].*)?$/, '$1$3');
          const parsed = dayjs(truncated || raw.createdAt);
          createdAtIso = parsed.isValid() ? parsed.toISOString() : dayjs().toISOString();
        } catch {
          createdAtIso = dayjs().toISOString();
        }
      } else {
        createdAtIso = dayjs().toISOString();
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
        createdAt: createdAtIso,
        dispatchId: raw.dispatchId ?? null,
        vehicleNumber: raw.vehicleNumber ?? null,
        driverName: raw.driverName ?? null,
        latitude: raw.latitude ?? null,
        longitude: raw.longitude ?? null,
        scheduledDepartureTime: raw.scheduledDepartureTime ? dayjs(raw.scheduledDepartureTime).toISOString() : null,
        isRead: !!raw.isRead,
      };
      // Only keep unread notifications in the context. If incoming is already read, ignore it
      if (incoming.isRead) {
        try { console.log('[Notification] realtime incoming ignored (isRead=true):', incoming.id); } catch {}
        return;
      }
      setNotifications(prev => {
        const map = new Map(prev.map(n => [n.id, n]));
        const existed = map.get(incoming.id);
        const merged = existed ? {
          ...existed,
          ...incoming,
          // preserve existing isRead OR incoming (incoming should be false here)
          isRead: existed.isRead || incoming.isRead,
          // pick the latest createdAt (ISO strings) using dayjs
          createdAt: dayjs(existed.createdAt).valueOf() > dayjs(incoming.createdAt).valueOf() ? existed.createdAt : incoming.createdAt,
        } : incoming;
        if (!merged.isRead) map.set(merged.id, merged);
        const arr = Array.from(map.values()).sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()).slice(0, 1000);
        try { console.log('[Notification] realtime merged -> unread count', arr.length); } catch {}
        return arr;
      });
      // 강제 재렌더 필요 시 버전 증가
      setVersion(v => v + 1);
    } catch (e) {
      console.error('[Notification] 실시간 메시지 처리 실패', e);
    }
  }, [toast]);

  // 초기 로드: 토큰이 있을 때만 시도
  useEffect(() => {
    refresh();
  }, [refresh]);

  // 로그인 직후(토큰 생성 시점) 최초 1회 강제 전체 알림 로드
  const initialFetchDoneRef = useRef(false);
  useEffect(() => {
    // token 이 존재하게 된 최초 시점에만 실행
    if (initialFetchDoneRef.current) return;
    if (token) {
      initialFetchDoneRef.current = true;
      refresh();
      console.log('[Notification] 로그인 후 초기 전체 알림 로드 수행 (token effect)');
    }
  }, [token, refresh]);

  // 토큰이 갱신될 때(예: refresh 성공) 서버에서 최신 알림을 다시 가져오도록 구독
  useEffect(() => {
    if (typeof onTokenRefresh !== 'function') return;
    const off = onTokenRefresh((newAccessToken) => {
      try { console.debug('[Notification] onTokenRefresh triggered, fetching latest unread notifications'); } catch {}
      // 새 토큰이 발급되면 즉시 동기화
      refresh();
    });
    return () => { try { off && off(); } catch {} };
  }, [onTokenRefresh, refresh]);

  // 공통 destination 상수 (완전 자동 구독)
  const NOTIFICATION_DEST = '/user/queue/notifications';
  // 연결 또는 Provider 마운트 후: 조건 만족 시 항상 구독 보장
  useEffect(() => {
    if (!isConnected) return; // 연결 전엔 대기
    const already = Array.isArray(subscribedDestinations) && subscribedDestinations.includes(NOTIFICATION_DEST);
    if (already) return;
    const ok = subscribePersistent(NOTIFICATION_DEST, handleRealtime);
    if (ok) {
      console.log('[Notification] 자동 구독 활성화:', NOTIFICATION_DEST);
    }
  }, [isConnected, subscribedDestinations, subscribePersistent, handleRealtime]);

  // 자동/receipt 구독 로깅 제거: 사용자가 버튼으로 구독 시 콘솔 출력

  // 프론트 임의 알림 추가용 함수 (탭 간 동기화 제거)


  const value = { 
    notifications, 
    unreadCount, 
    loading, 
    error, 
    refresh, 
    markAsRead,
    version,
  };
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
