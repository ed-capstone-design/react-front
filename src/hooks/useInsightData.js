import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useToken } from '../components/Token/TokenProvider';
import { useNotification } from '../components/Notification/contexts/NotificationProvider';

/**
 * useInsightData (Status 기반 Insight 전용)
 * 기간: 어제 ~ 내일 (3일)
 * KPI: todayTotal, todayCompleted, todayDelayed, todayRemaining
 * todayRemaining = SCHEDULED + RUNNING + DELAYED (CANCELED/COMPLETED 제외)
 * todayTotal = 오늘 status != CANCELED 전체
 */
export const useInsightData = () => {
  const { getToken } = useToken();
  const { unreadCount = 0 } = useNotification();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dispatches, setDispatches] = useState([]);
  const abortRef = useRef(null);

  // 날짜 범위 (어제~내일)
  const range = useMemo(() => {
    const today = new Date();
    const start = new Date(today); start.setDate(today.getDate() - 1);
    const end = new Date(today); end.setDate(today.getDate() + 1);
    const toStr = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    return { start: toStr(start), end: toStr(end) };
  }, []);

  const todayStr = useMemo(() => new Date().toISOString().slice(0,10), []);

  const normalizeDate = (d) => {
    if (d.dispatchDate) return d.dispatchDate;
    if (d.scheduledDeparture) return String(d.scheduledDeparture).slice(0,10);
    if (d.date) return d.date;
    return null;
  };

  const fetchRange = useCallback(async () => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    const { signal } = abortRef.current;
    setLoading(true); setError(null);
    try {
      const res = await axios.get('/api/admin/dispatches', {
        params: { startDate: range.start, endDate: range.end },
        headers: { Authorization: `Bearer ${token}` },
        signal
      });
      const raw = res.data?.data || res.data || [];
      const list = Array.isArray(raw) ? raw.map(r => ({ ...r, _normDate: normalizeDate(r), _normStatus: (r.status||'').toUpperCase() })) : [];
      setDispatches(list);
    } catch (e) {
      if (axios.isCancel(e)) return; setError(e); console.error('[useInsightData] fetch 실패', e);
    } finally { setLoading(false); }
  }, [getToken, range.start, range.end]);

  useEffect(() => { fetchRange(); return () => abortRef.current?.abort(); }, [fetchRange]);

  // 오늘 배차
  const todayDispatches = useMemo(() => dispatches.filter(d => d._normDate === todayStr), [dispatches, todayStr]);

  // 상태별 배열
  const partition = useMemo(() => {
    const m = { RUNNING: [], SCHEDULED: [], DELAYED: [], COMPLETED: [], CANCELED: [], OTHER: [] };
    todayDispatches.forEach(d => {
      const s = d._normStatus;
      if (m[s]) m[s].push(d); else m.OTHER.push(d);
    });
    return m;
  }, [todayDispatches]);

  const todayTotal = useMemo(() => todayDispatches.filter(d => d._normStatus !== 'CANCELED').length, [todayDispatches]);
  const todayCompleted = partition.COMPLETED.length;
  const todayDelayed = partition.DELAYED.length;
  const todayRemaining = useMemo(() => partition.SCHEDULED.length + partition.RUNNING.length + partition.DELAYED.length, [partition]);
  const runningList = partition.RUNNING;

  // 지도 마커 RUNNING 기준
  const markers = useMemo(() => runningList.map(r => ({
    id: r.dispatchId,
    lat: r.latitude || r.lat || 37.5665,
    lng: r.longitude || r.lng || 126.9780,
    title: r.driverName || r.vehicleNumber || '운행중'
  })), [runningList]);

  const kpis = { todayTotal, todayCompleted, todayDelayed, todayRemaining };

  return {
    loading, error, refresh: fetchRange,
    dispatches, todayDispatches, runningList, markers,
    kpis, unreadCount,
    range, todayStr, partition,
  };
};
