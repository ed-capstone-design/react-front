import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useToken } from "../components/Token/TokenProvider";
import { useNotification } from "../components/Notification/contexts/NotificationProvider";

// 레거시 복원 버전 (단일 훅 내 fetch + 파생 계산)

export const useDashboardData = () => {
  const { getToken } = useToken();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 원시 데이터
  const [driversAll, setDriversAll] = useState([]);
  const [dispatches7d, setDispatches7d] = useState([]);
  const abortRef = useRef(null);

  // 안전 필드 접근 유틸
  // --- Date/Time Normalization Helpers (강화 버전) ---
  // 환경설정 기반 타임존 보정 (서버 UTC → 로컬 KST 등)
  const tzOffsetMinutes = useMemo(() => {
    const v = parseInt(process.env.REACT_APP_TZ_OFFSET_MINUTES || '0', 10);
    return Number.isFinite(v) ? v : 0;
  }, []);

  const toLocalDateStrWithOffset = (date) => {
    if (!date) return null;
    try {
      const ms = date.getTime() + tzOffsetMinutes * 60 * 1000;
      const shifted = new Date(ms);
      return shifted.toISOString().slice(0, 10);
    } catch { return null; }
  };

  const isoToLocalDateStr = (isoLike) => {
    if (!isoLike) return null;
    try {
      const d = new Date(isoLike);
      if (Number.isNaN(d.getTime())) return null;
      return toLocalDateStrWithOffset(d);
    } catch { return null; }
  };

  const looksLikeYMD = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);

  const getCandidateDates = (d) => {
    if (!d) return [];
    const list = [];
    if (looksLikeYMD(d.dispatchDate)) list.push(d.dispatchDate);
    if (looksLikeYMD(d.date)) list.push(d.date);
    if (d.scheduledDeparture) list.push(isoToLocalDateStr(d.scheduledDeparture));
    if (d.scheduledArrival) list.push(isoToLocalDateStr(d.scheduledArrival));
    // fallback: if departureTime only + date already handled above
    return list.filter(Boolean);
  };

  const deriveLocalDate = (dispatch) => {
    const cands = getCandidateDates(dispatch);
    return cands.length ? cands[0] : null; // 우선순위 첫 값
  };

  const getDateStr = (d) => d?._localDate || deriveLocalDate(d);
  const getDepTimeStr = (d) => {
    if (!d) return null;
    if (d.departureTime) return d.departureTime; // HH:mm[:ss]
    if (d.scheduledDeparture) return String(d.scheduledDeparture).split("T")[1];
    return null;
  };
  const getArrTimeStr = (d) => {
    if (!d) return null;
    if (d.arrivalTime) return d.arrivalTime; // HH:mm[:ss]
    if (d.scheduledArrival) return String(d.scheduledArrival).split("T")[1];
    return null;
  };

  const toDate = (dateStr, timeStr) => {
    try {
      if (!dateStr) return null;
      if (!timeStr) return new Date(`${dateStr}T00:00:00`);
      const t = timeStr.length === 5 ? `${timeStr}:00` : timeStr;
      return new Date(`${dateStr}T${t}`);
    } catch { return null; }
  };

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const sevenDaysRange = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6); // 최근 7일
    const toStr = (d) => d.toISOString().slice(0, 10);
    return { startStr: toStr(start), endStr: toStr(end) };
  }, []);

  const fetchAll = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    const { signal } = abortRef.current;

    setLoading(true);
    setError(null);
    try {
      const authHeader = { Authorization: `Bearer ${token}` };
      const [dispatchRes, driversRes] = await Promise.all([
        axios.get("/api/admin/dispatches", {
          params: { startDate: sevenDaysRange.startStr, endDate: sevenDaysRange.endStr },
            headers: authHeader,
          signal
        }),
        axios.get("/api/admin/drivers", { headers: authHeader, signal })
      ]);
      const rawDispatches = dispatchRes.data?.data || dispatchRes.data || [];
      const drivers = driversRes.data?.data || driversRes.data || [];
      const enhanced = Array.isArray(rawDispatches) ? rawDispatches.map(ds => ({
        ...ds,
        _localDate: deriveLocalDate(ds),
      })) : [];
      setDispatches7d(enhanced);
      setDriversAll(Array.isArray(drivers) ? drivers : []);
    } catch (err) {
      if (axios.isCancel(err)) return;
      console.error('[useDashboardData] 데이터 로딩 실패:', err);
      setError(err.response?.data?.message || err.message || '대시보드 데이터 로딩 실패');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sevenDaysRange.startStr, sevenDaysRange.endStr, getToken]);

  const todayDispatches = useMemo(() => {
    if (!dispatches7d.length) return [];
    return dispatches7d.filter(d => getDateStr(d) === todayStr);
  }, [dispatches7d, todayStr]);

  const ongoingCount = useMemo(() => {
    const now = new Date();
    return todayDispatches.filter(d => {
      const dateStr = getDateStr(d);
      const dep = toDate(dateStr, getDepTimeStr(d));
      const arr = toDate(dateStr, getArrTimeStr(d));
      if (!dep || !arr) return false;
      return now >= dep && now <= arr;
    }).length;
  }, [todayDispatches]);

  const { unreadCount = 0 } = useNotification?.() || {};
  const kpiCounts = useMemo(() => ({
    totalDrivers: driversAll?.length || 0,
    todayTotal: todayDispatches.length,
    ongoing: ongoingCount,
    unreadNotifications: unreadCount
  }), [driversAll, todayDispatches.length, ongoingCount, unreadCount]);

  const weeklyCounts = useMemo(() => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const base = new Date();
      base.setDate(base.getDate() - i);
      const key = toLocalDateStrWithOffset(base);
      const count = dispatches7d.filter(x => getDateStr(x) === key).length;
      result.push({ date: key, count });
    }
    return result;
  }, [dispatches7d, toLocalDateStrWithOffset]);

  const hourlyDistribution = useMemo(() => {
    const buckets = Array.from({ length: 24 }, (_, h) => ({ hour: h, count: 0 }));
    dispatches7d.forEach(d => {
      const t = getDepTimeStr(d);
      if (!t) return;
      const h = parseInt(t.slice(0, 2), 10);
      if (!Number.isNaN(h) && h >= 0 && h < 24) buckets[h].count += 1;
    });
    return buckets;
  }, [dispatches7d]);

  return {
    loading,
    error,
    refresh: fetchAll,
    driversAll,
    dispatches7d,
    todayDispatches,
    kpiCounts,
    weeklyCounts,
    hourlyDistribution,
    ongoingCount,
    unreadCount,
    range: sevenDaysRange,
    todayStr
  };
};
