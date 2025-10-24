import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import client from '../api/client';
import axios from 'axios';
import { useToken } from '../components/Token/TokenProvider';
import { useWebSocket } from '../components/WebSocket/WebSocketProvider';
import { useNotification } from '../components/Notification/contexts/NotificationProvider';

// 구성 상수: 나중 1초 주기로 바뀔 때 EXPECTED_INTERVAL_MS만 1000으로 변경
const EXPECTED_INTERVAL_MS = 10000; // 추후 1000 예정
const STALE_MULTIPLIER = 3; // 3배 기간 수신 없으면 stale
const STALE_THRESHOLD_LOCATION = EXPECTED_INTERVAL_MS * STALE_MULTIPLIER;
const STALE_THRESHOLD_OBD = EXPECTED_INTERVAL_MS * STALE_MULTIPLIER;

// 버퍼 유지 기간 (ms)
const BUFFER_WINDOWS = {
  location: 5 * 60 * 1000, // 5분
  obd: 60 * 1000, // 1분
};

// 안전 파싱 유틸: 서버 timestamp 미존재 시 수신 시각 주입
function normalizeTimestamp(sample) {
  if (!sample) return sample;
  if (!sample.timestamp) {
    return { ...sample, timestamp: new Date().toISOString() };
  }
  return sample;
}

/**
 * useLiveDispatch(dispatchId)
 * - 역할: 배차의 실시간 위치/OBD 구독을 관리하고, 동일 훅에서 운행 이벤트와 주행기록(driving-record)을 조회/갱신합니다.
 * - 반환: { loading, error, meta, latestLocation, latestObd, kpis, stale,
 *            locationSamples, obdSamples,
 *            driveEvents, driveRecord, eventsLoading, eventsError, refreshEvents }
 *
 * 메모: 훅 내부에서 알림(notification) 버전 변화를 감시하여 관련 알림이 들어오면 이벤트를 재조회합니다.
 */
export function useLiveDispatch(dispatchId) {
  const { subscribeDispatchLocation, subscribeDispatchObd } = useWebSocket();
  const { getToken } = useToken();
  const { version: notificationVersion, notifications } = useNotification();

  // 상태: 메타/실시간 샘플
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);
  const [latestLocation, setLatestLocation] = useState(null);
  const [latestObd, setLatestObd] = useState(null);
  const locationBufferRef = useRef([]);
  const obdBufferRef = useRef([]);
  const [tick, setTick] = useState(0);

  // 이벤트/주행기록 상태 (이 훅으로 합쳤음)
  const [driveEvents, setDriveEvents] = useState([]);
  const [driveRecord, setDriveRecord] = useState(null);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(null);

  // 1) 배차 메타 초기 로드
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!dispatchId) return;
      setLoading(true); setError(null);
      try {
        const token = getToken && getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await client.get(`/api/admin/dispatches/${dispatchId}`, { headers });
        const raw = res?.data;
        let detail = raw;
        if (raw && typeof raw === 'object' && 'data' in raw && raw.data) detail = raw.data;
        if (!cancelled) setMeta(detail);
      } catch (e) {
        if (!cancelled) setError(e);
        console.error('[useLiveDispatch] dispatch 메타 로드 실패', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [dispatchId]);

  // 2) 슬라이딩 버퍼 유틸
  const pushBuffer = useCallback((ref, sample, windowMs) => {
    ref.current.push(sample);
    const cutoff = Date.now() - windowMs;
    while (ref.current.length > 0) {
      const first = ref.current[0];
      const t = new Date(first.timestamp).getTime();
      if (t < cutoff) ref.current.shift(); else break;
    }
  }, []);

  // 3) 실시간 구독 설정 (위치/OBD)
  useEffect(() => {
    if (!dispatchId) return;
    const unsubLoc = subscribeDispatchLocation(dispatchId, (loc) => {
      const norm = normalizeTimestamp(loc);
      setLatestLocation(norm);
      pushBuffer(locationBufferRef, norm, BUFFER_WINDOWS.location);
      setTick(t => t + 1);
    });
    const unsubObd = subscribeDispatchObd(dispatchId, (obd) => {
      const norm = normalizeTimestamp(obd);
      setLatestObd(norm);
      pushBuffer(obdBufferRef, norm, BUFFER_WINDOWS.obd);
      setTick(t => t + 1);
    });
    return () => {
      try { unsubLoc && unsubLoc(); } catch {}
      try { unsubObd && unsubObd(); } catch {}
    };
  }, [dispatchId, subscribeDispatchLocation, subscribeDispatchObd, pushBuffer]);

  // 4) 이벤트/주행기록 조회 함수 (원래 useDispatchEvents 내용 통합)
  const fetchEvents = useCallback(async () => {
    if (!dispatchId) return;
    setEventsLoading(true);
    setEventsError(null);
    try {
      const token = getToken && getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const [eventsRes, recordRes] = await Promise.all([
        axios.get(`/api/admin/dispatches/${dispatchId}/events`, { headers }),
        axios.get(`/api/admin/dispatches/${dispatchId}/driving-record`, { headers }).catch(e => ({ __err: e }))
      ]);
      const eventsData = eventsRes.data?.data ?? eventsRes.data ?? [];
      setDriveEvents(Array.isArray(eventsData) ? eventsData : [eventsData]);
      if (recordRes && recordRes.__err) {
        setDriveRecord(null);
      } else {
        const rec = recordRes.data?.data ?? recordRes.data ?? null;
        setDriveRecord(rec);
      }
    } catch (err) {
      setEventsError(err.response?.data?.message || err.message || '운행 이벤트 조회 실패');
      setDriveEvents([]);
      setDriveRecord(null);
    } finally {
      setEventsLoading(false);
    }
  }, [dispatchId, getToken]);

  // 초기 로드: 이벤트/주행기록
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // 5) 알림 기반 자동 리프레시: 새 알림이 들어오면 관련 배차면 events 재조회
  useEffect(() => {
    if (!dispatchId) return;
    try {
      if (!useLiveDispatch._prevNotifIds) useLiveDispatch._prevNotifIds = new Set();
      const prevIds = useLiveDispatch._prevNotifIds;
      const current = Array.isArray(notifications) ? notifications : [];
      const currentIds = new Set(current.map(n => n?.id).filter(Boolean));
      const newIds = Array.from(currentIds).filter(id => !prevIds.has(id));
      useLiveDispatch._prevNotifIds = currentIds;
      if (newIds.length === 0) return;
      const related = newIds.some(id => {
        const n = current.find(x => x?.id === id);
        if (!n) return false;
        const nid = n.dispatchId ?? n.dispatchID ?? n.refId ?? n.referenceId ?? n.data?.dispatchId ?? n.payload?.dispatchId ?? null;
        return nid != null && String(nid) === String(dispatchId);
      });
      if (related) fetchEvents();
    } catch (e) {
      // swallow
    }
  }, [notificationVersion, notifications, dispatchId, fetchEvents]);

  // 6) stale 판단
  const stale = useMemo(() => {
    const now = Date.now();
    let locationStale = false;
    let obdStale = false;
    if (latestLocation) {
      const t = new Date(latestLocation.timestamp).getTime();
      locationStale = now - t > STALE_THRESHOLD_LOCATION;
    }
    if (latestObd) {
      const t = new Date(latestObd.timestamp).getTime();
      obdStale = now - t > STALE_THRESHOLD_OBD;
    }
    return { location: locationStale, obd: obdStale };
  }, [latestLocation, latestObd, loading, tick]);

  // 7) KPI 파생
  const kpis = useMemo(() => ({
    speed: latestObd?.speed ?? latestLocation?.speed ?? null,
    rpm: latestObd?.engineRpm ?? null,
    soc: latestObd?.soc ?? null,
    torque: latestObd?.torque ?? null,
    throttle: latestObd?.throttle ?? null,
    brake: latestObd?.brake ?? null,
    stalled: latestObd?.stalled ?? null,
    lastLocationAgeSec: latestLocation ? ((Date.now() - new Date(latestLocation.timestamp).getTime()) / 1000).toFixed(1) : null,
    lastObdAgeSec: latestObd ? ((Date.now() - new Date(latestObd.timestamp).getTime()) / 1000).toFixed(1) : null,
  }), [latestLocation, latestObd, tick]);

  return {
    // 기본 실시간 데이터
    loading,
    error,
    meta,
    latestLocation,
    latestObd,
    kpis,
    stale,
    locationSamples: locationBufferRef.current,
    obdSamples: obdBufferRef.current,
    // 이벤트/주행기록
    driveEvents,
    driveRecord,
    eventsLoading,
    eventsError,
    refreshEvents: fetchEvents,
  };
}

export default useLiveDispatch;