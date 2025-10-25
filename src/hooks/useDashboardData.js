import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import dayjs from 'dayjs';
import { useToken } from "../components/Token/TokenProvider";
import { useNotification } from "../components/Notification/contexts/NotificationProvider";

// 레거시 복원 버전 (단일 훅 내 fetch + 파생 계산)

export const useDashboardData = () => {
  const { getToken, accessToken, onTokenRefresh } = useToken();
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

  // --- additional helpers for today parsing (prefer scheduledDepartureTime) ---
  const formatLocalDate = (dt) => {
    if (!dt) return null;
    try {
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, '0');
      const d = String(dt.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    } catch { return null; }
  };

  const parseToLocalDateStr = (val) => {
    if (val == null) return null;
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    try {
      let n = (typeof val === 'number' || String(Number(val)) === String(val)) ? Number(val) : val;
      if (typeof n === 'number' && n > 0 && n < 1e12) {
        if (n < 1e11) n = n * 1000;
      }
      const dt = new Date(n);
      if (Number.isNaN(dt.getTime())) return null;
      return formatLocalDate(dt);
    } catch { return null; }
  };

  // parse any date-like value to Date object (handles numeric seconds/ms and ISO)
  const toDateObj = (val) => {
    if (val == null) return null;
    try {
      if (typeof val === 'number' || String(Number(val)) === String(val)) {
        let n = Number(val);
        if (n > 0 && n < 1e12) { if (n < 1e11) n = n * 1000; }
        return new Date(n);
      }
      const dt = new Date(val);
      if (Number.isNaN(dt.getTime())) return null;
      return dt;
    } catch { return null; }
  };

  const parseAnyDateStr = (obj, keys = []) => {
    if (!obj) return null;
    for (const k of keys) {
      const v = obj[k];
      if (v != null) {
        const s = parseToLocalDateStr(v) || isoToLocalDateStr(v) || null;
        if (s) return s;
      }
    }
    return null;
  };

  const isoToLocalDateStr = (isoLike) => {
    if (!isoLike) return null;
    try {
      // Normalize fractional seconds: if backend sends microseconds (6+ digits) trim to milliseconds (3 digits)
      try {
        const s = String(isoLike);
        const truncated = s.replace(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3})\d+(Z|[+\-].*)?$/, '$1$2');
        const d = new Date(truncated);
        if (Number.isNaN(d.getTime())) return null;
        return toLocalDateStrWithOffset(d);
      } catch (e) {
        const d = new Date(isoLike);
        if (Number.isNaN(d.getTime())) return null;
        return toLocalDateStrWithOffset(d);
      }
    } catch { return null; }
  };

  const looksLikeYMD = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);

  const getCandidateDates = (d) => {
    if (!d) return [];
    const list = [];
    if (looksLikeYMD(d.dispatchDate)) list.push(d.dispatchDate);
    if (looksLikeYMD(d.date)) list.push(d.date);
    // include scheduledDepartureTime (may be time-only or full ISO) and scheduledDeparture
    if (d.scheduledDepartureTime) list.push(parseToLocalDateStr(d.scheduledDepartureTime) || isoToLocalDateStr(d.scheduledDepartureTime));
    if (d.scheduledDeparture) list.push(isoToLocalDateStr(d.scheduledDeparture));
    if (d.scheduledArrivalTime) list.push(parseToLocalDateStr(d.scheduledArrivalTime) || isoToLocalDateStr(d.scheduledArrivalTime));
    if (d.scheduledArrival) list.push(isoToLocalDateStr(d.scheduledArrival));
    // fallback: if departureTime only + date already handled above
    return list.filter(Boolean);
  };

  const deriveLocalDate = (dispatch) => {
    const cands = getCandidateDates(dispatch);
    return cands.length ? cands[0] : null; // 우선순위 첫 값
  };

  // Normalize schedule date/times similar to useOperatingSchedule
  const normalizeScheduleDateTimes = (payload) => {
    try {
      const out = { ...payload };
      // Find base date: try dispatchDate, date, scheduledDate, or use todayStr as fallback
      const baseDate = out.dispatchDate || out.date || out.scheduledDate || todayStr || '';

      const pad = (n) => String(n).padStart(2, '0');
      const formatLocalIso = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

      const normalizeTimeOnly = (timeStr) => {
        if (timeStr == null) return null;
        if (typeof timeStr !== 'string') timeStr = String(timeStr);
        if (timeStr.includes('T')) {
          const part = timeStr.split('T')[1] || '';
          return part.substring(0,5);
        }
        const m = timeStr.match(/(\d{1,2}:\d{2})/);
        return m ? m[1] : null;
      };

      const combineDateAndTime = (dateStr, timeStr) => {
        const t = normalizeTimeOnly(timeStr) || '00:00';
        return `${dateStr}T${t}:00`;
      };

      // scheduledDepartureTime
      if (out.scheduledDepartureTime) {
        if (!out.scheduledDepartureTime.includes('T')) {
          out.scheduledDepartureTime = combineDateAndTime(baseDate, out.scheduledDepartureTime);
        }
      }
      if (!out.scheduledDepartureTime && out.scheduledDeparture) {
        out.scheduledDepartureTime = out.scheduledDeparture;
      }

      // scheduledArrivalTime
      if (out.scheduledArrivalTime) {
        if (!out.scheduledArrivalTime.includes('T')) {
          out.scheduledArrivalTime = combineDateAndTime(baseDate, out.scheduledArrivalTime);
        }
      }
      if (!out.scheduledArrivalTime && out.scheduledArrival) {
        out.scheduledArrivalTime = out.scheduledArrival;
      }

      // If both exist, and arrival <= departure, add 1 day to arrival
      if (out.scheduledDepartureTime && out.scheduledArrivalTime) {
        const dep = new Date(out.scheduledDepartureTime);
        let arr = new Date(out.scheduledArrivalTime);
        if (!Number.isNaN(dep.getTime()) && !Number.isNaN(arr.getTime()) && arr.getTime() <= dep.getTime()) {
          arr = new Date(arr.getTime() + 24 * 3600 * 1000);
          out.scheduledArrivalTime = formatLocalIso(arr);
        }
      }

      return out;
    } catch (e) {
      return payload;
    }
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

  // Use dayjs (consistent with useOperatingSchedule) and respect tzOffsetMinutes
  const todayStr = useMemo(() => {
    try {
      return dayjs().add(tzOffsetMinutes, 'minute').format('YYYY-MM-DD');
    } catch (e) {
      return dayjs().format('YYYY-MM-DD');
    }
  }, [tzOffsetMinutes]);

  const sevenDaysRange = useMemo(() => {
    const end = dayjs().add(tzOffsetMinutes, 'minute');
    const start = end.subtract(6, 'day'); // 최근 7일
    return { startStr: start.format('YYYY-MM-DD'), endStr: end.format('YYYY-MM-DD') };
  }, [tzOffsetMinutes]);

  const fetchAll = async () => {
    // prefer context accessToken when available (reactive), fallback to getToken()
    const token = accessToken || (getToken && getToken());
    if (!token) {
      console.debug('[useDashboardData] fetchAll aborted - no token yet');
      setLoading(false);
      return;
    }
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    const { signal } = abortRef.current;

    setLoading(true);
    setError(null);
    try {
  // Backend expects plain YYYY-MM-DD date strings (no time or trailing 'Z').
  // Send date-only strings for startDate/endDate to match server parsing.
  const startDateParam = sevenDaysRange.startStr;
  const endDateParam = sevenDaysRange.endStr;
  console.debug('[useDashboardData] fetchAll start', { startDateParam, endDateParam, tokenPreview: token ? token.substring(0,10) + '...' : null });
      const authHeader = { Authorization: `Bearer ${token}` };
      const [dispatchRes, driversRes] = await Promise.all([
        axios.get("/api/admin/dispatches", {
          params: { startDate: startDateParam, endDate: endDateParam },
            headers: authHeader,
          signal
        }),
        axios.get("/api/admin/drivers", { headers: authHeader, signal })
      ]);
      console.debug('[useDashboardData] fetchAll responses received', {
        dispatchStatus: dispatchRes?.status,
        driversStatus: driversRes?.status,
        dispatchCount: Array.isArray(dispatchRes?.data?.data || dispatchRes?.data) ? (dispatchRes.data.data || dispatchRes.data).length : null,
        driversCount: Array.isArray(driversRes?.data?.data || driversRes?.data) ? (driversRes.data.data || driversRes.data).length : null
      });
      const rawDispatches = dispatchRes.data?.data || dispatchRes.data || [];
      const drivers = driversRes.data?.data || driversRes.data || [];
      const enhanced = Array.isArray(rawDispatches) ? rawDispatches.map(ds => {
        const norm = normalizeScheduleDateTimes(ds);
        return {
          ...ds,
          ...norm,
          _localDate: deriveLocalDate(norm),
        };
      }) : [];
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
    // Re-run when date range or accessToken changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sevenDaysRange.startStr, sevenDaysRange.endStr, accessToken]);

  // If token is refreshed later (refresh flow), ensure we re-fetch dashboard data
  useEffect(() => {
    if (typeof onTokenRefresh !== 'function') return;
    const off = onTokenRefresh((newToken) => {
      try { console.debug('[useDashboardData] onTokenRefresh triggered, re-fetching dashboard data'); } catch {}
      fetchAll();
    });
    return () => { try { off && off(); } catch {} };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onTokenRefresh, sevenDaysRange.startStr, sevenDaysRange.endStr]);

  // fetch only today's dispatches via API (to mirror useOperatingSchedule approach)
  const [todayDispatchesFromApi, setTodayDispatchesFromApi] = useState([]);
  const fetchToday = async () => {
    const token = accessToken || (getToken && getToken());
    if (!token) return;
    try {
  // Send date-only params for today's range (backend expects YYYY-MM-DD)
  const startDateParam = todayStr;
  const endDateParam = todayStr;
  console.debug('[useDashboardData] fetchToday start', { today: todayStr, startDateParam, endDateParam, tokenPreview: token ? token.substring(0,10) + '...' : null });
      const authHeader = { Authorization: `Bearer ${token}` };
  const resp = await axios.get('/api/admin/dispatches', { params: { startDate: startDateParam, endDate: endDateParam }, headers: authHeader });
      console.debug('[useDashboardData] fetchToday response', { status: resp?.status, count: Array.isArray(resp?.data?.data || resp?.data) ? (resp.data.data || resp.data).length : null });
      const raw = resp.data?.data || resp.data || [];
      const enhancedToday = Array.isArray(raw) ? raw.map(ds => ({ ...ds, ...normalizeScheduleDateTimes(ds), _localDate: deriveLocalDate(ds) })) : [];
      setTodayDispatchesFromApi(enhancedToday);
    } catch (e) {
      console.error('[useDashboardData] fetchToday failed', e?.response?.status, e?.message || e);
      console.error('[useDashboardData] fetchToday 실패', e);
    }
  };

  useEffect(() => { fetchToday(); }, [todayStr, accessToken]);

  // Prefer API-provided today's dispatches (mirrors useOperatingSchedule) but fall back to 7d-derived
  const todayDispatches = useMemo(() => {
    if (todayDispatchesFromApi && todayDispatchesFromApi.length) return todayDispatchesFromApi;
    if (!dispatches7d.length) return [];
    return dispatches7d.filter(d => getDateStr(d) === todayStr);
  }, [dispatches7d, todayStr, todayDispatchesFromApi]);

  // Helpers to extract scheduled/actual times (ISO or epoch) and return Date objects
  const getScheduledDeparture = (d) => toDateObj(d.scheduledDepartureTime ?? d.scheduledDeparture ?? d.scheduledDepartureDate ?? null);
  const getScheduledArrival = (d) => toDateObj(d.scheduledArrivalTime ?? d.scheduledArrival ?? d.scheduledArrivalDate ?? null);
  const getActualDeparture = (d) => toDateObj(d.actualDepartureTime ?? d.actualDeparture ?? d.departureTime ?? null);
  const getActualArrival = (d) => toDateObj(d.actualArrivalTime ?? d.actualArrival ?? d.arrivalTime ?? null);

  // classify today's dispatches into panels
  const todayScheduled = useMemo(() => (
    todayDispatches.slice().sort((a,b) => {
      const A = getScheduledDeparture(a) || getActualDeparture(a) || new Date(0);
      const B = getScheduledDeparture(b) || getActualDeparture(b) || new Date(0);
      return A - B;
    })
  ), [todayDispatches]);

  const todayRunning = useMemo(() => (
    todayDispatches.filter(d => {
      // running if status normalized is RUNNING OR current between dep/arr (using actual if present)
      const st = normalizeStatus(d.status ?? d.dispatchStatus ?? d.state ?? d.statusCode);
      if (st === 'RUNNING') return true;
      const dep = getActualDeparture(d) || getScheduledDeparture(d);
      const arr = getActualArrival(d) || getScheduledArrival(d);
      if (!dep || !arr) return false;
      const now = new Date();
      return now >= dep && now <= arr;
    }).sort((a,b) => (getActualDeparture(a) || getScheduledDeparture(a) || new Date(0)) - (getActualDeparture(b) || getScheduledDeparture(b) || new Date(0)))
  ), [todayDispatches]);

  const todayCompleted = useMemo(() => (
    todayDispatches.filter(d => {
      const st = normalizeStatus(d.status ?? d.dispatchStatus ?? d.state ?? d.statusCode);
      if (st === 'COMPLETED') return true;
      // completed if actualArrival exists and is before now
      const arrival = getActualArrival(d);
      if (arrival) return arrival <= new Date();
      return false;
    }).sort((a,b) => (getActualArrival(a) || new Date(0)) - (getActualArrival(b) || new Date(0)))
  ), [todayDispatches]);

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

  // normalize status helper (선언을 사용부 이전에 둡니다)
  function normalizeStatus(s) {
    if (s == null) return 'SCHEDULED';
    const raw = String(s).trim().toUpperCase();
    const map = {
      SCHEDULED: 'SCHEDULED', PLANNED: 'SCHEDULED',
      RUNNING: 'RUNNING', IN_PROGRESS: 'RUNNING', INPROGRESS: 'RUNNING', ONGOING: 'RUNNING', STARTED: 'RUNNING',
      COMPLETED: 'COMPLETED', FINISHED: 'COMPLETED', DONE: 'COMPLETED', ENDED: 'COMPLETED',
      CANCELED: 'CANCELED', CANCELLED: 'CANCELED', VOID: 'CANCELED'
    };
    return map[raw] || 'SCHEDULED';
  }

  const todayByStatus = useMemo(() => {
    const groups = { SCHEDULED: [], RUNNING: [], COMPLETED: [], CANCELED: [] };
    todayDispatches.forEach(d => {
      const statusCandidate = d.status ?? d.dispatchStatus ?? d.state ?? d.statusCode;
      const st = normalizeStatus(statusCandidate);
      groups[st].push(d);
    });
    return groups;
  }, [todayDispatches]);

  const todayTotalNonCanceled = useMemo(() => (
    todayDispatches.filter(d => normalizeStatus(d.status ?? d.dispatchStatus ?? d.state ?? d.statusCode) !== 'CANCELED').length
  ), [todayDispatches]);

  const kpiCounts = useMemo(() => ({
    totalDrivers: driversAll?.length || 0,
    todayTotal: todayTotalNonCanceled,
    ongoing: todayByStatus.RUNNING.length,
    unreadNotifications: unreadCount
  }), [driversAll, todayTotalNonCanceled, todayByStatus, unreadCount]);

  const weeklyCounts = useMemo(() => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const base = dayjs().subtract(i, 'day').add(tzOffsetMinutes, 'minute');
      const key = base.format('YYYY-MM-DD');
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
    todayScheduled,
    todayRunning,
    todayCompleted,
    todayByStatus,
    kpiCounts,
    weeklyCounts,
    hourlyDistribution,
    ongoingCount,
    unreadCount,
    range: sevenDaysRange,
    todayStr
  };
};
