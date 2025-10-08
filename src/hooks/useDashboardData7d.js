import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useToken } from '../components/Token/TokenProvider';
import { useNotification } from '../components/Notification/contexts/NotificationProvider';

// 최근 7일 (오늘 포함) 대시보드용 경량 훅
export const useDashboardData7d = () => {
  const { getToken } = useToken();
  const { unreadCount = 0 } = useNotification();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dispatches, setDispatches] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const abortRef = useRef(null);

  const range = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);
    const toStr = (d) => d.toISOString().slice(0,10);
    return { start: toStr(start), end: toStr(end) };
  }, []);

  const fetchAll = useCallback(async () => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    const { signal } = abortRef.current;
    setLoading(true); setError(null);
    try {
      const auth = { Authorization: `Bearer ${token}` };
      const [dRes, drvRes] = await Promise.all([
        axios.get('/api/admin/dispatches', { params: { startDate: range.start, endDate: range.end }, headers: auth, signal }),
        axios.get('/api/admin/drivers', { headers: auth, signal })
      ]);
      const ds = dRes.data?.data || dRes.data || [];
      const drs = drvRes.data?.data || drvRes.data || [];
      setDispatches(Array.isArray(ds) ? ds : []);
      setDrivers(Array.isArray(drs) ? drs : []);
    } catch (e) {
      if (axios.isCancel(e)) return; else setError(e);
    } finally { setLoading(false); }
  }, [getToken, range.start, range.end]);

  useEffect(() => { fetchAll(); return () => abortRef.current?.abort(); }, [fetchAll]);

  const todayStr = useMemo(()=> new Date().toISOString().slice(0,10), []);
  const todayDispatches = useMemo(()=> dispatches.filter(d => {
    const dateStr = d.dispatchDate || (d.scheduledDeparture && String(d.scheduledDeparture).slice(0,10)) || d.date;
    return dateStr === todayStr;
  }), [dispatches, todayStr]);

  const kpiCounts = useMemo(()=>({
    totalDrivers: drivers.length,
    todayTotal: todayDispatches.length,
    ongoing: todayDispatches.filter(d => d.status === 'RUNNING').length,
    unreadNotifications: unreadCount,
  }), [drivers.length, todayDispatches, unreadCount]);

  return {
    loading, error, refresh: fetchAll,
    driversAll: drivers,
    dispatches7d: dispatches,
    todayDispatches,
    kpiCounts,
    unreadCount,
    range,
    todayStr,
  };
};
