import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useToken } from "../components/Token/TokenProvider";
import { useNotification } from "../components/Notification/NotificationProvider";

// baseURL은 TokenProvider에서 중앙 설정합니다.

/**
 * useDashboardData
 * - 초기 1회 병렬 호출로 중복을 없애고, 파생값은 모두 클라이언트에서 메모화해 제공
 * - 원시데이터: driversAll, dispatches7d, notificationsAll
 * - 파생데이터: todayDispatches, kpiCounts, weeklyCounts, hourlyDistribution, soonStarting, ongoingCount, unreadCount
 */
export const useDashboardData = () => {
  const { getToken } = useToken();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 원시 데이터
  const [driversAll, setDriversAll] = useState([]);
  const [dispatches7d, setDispatches7d] = useState([]);

  const abortRef = useRef(null);

  // 안전한 필드 접근 유틸들 (백엔드 필드명 변동에 대비)
  const getDateStr = (d) => {
    if (!d) return null;
    if (d.dispatchDate) return d.dispatchDate; // YYYY-MM-DD
    if (d.scheduledDeparture) return String(d.scheduledDeparture).slice(0, 10);
    if (d.departureTime && d.date) return d.date; // 혹시 별도 보유
    return null;
  };
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
      const t = timeStr.length === 5 ? `${timeStr}:00` : timeStr; // HH:mm -> HH:mm:ss
      return new Date(`${dateStr}T${t}`);
    } catch {
      return null;
    }
  };

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const sevenDaysRange = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6); // 최근 7일 (오늘 포함)
    const toStr = (d) => d.toISOString().slice(0, 10);
    return { startStr: toStr(start), endStr: toStr(end) };
  }, []);

  const fetchAll = async () => {
    const token = getToken();
    if (!token) {
      // 토큰이 아직 로딩 중이거나 로그아웃 상태일 수 있음: 에러 대신 조용히 종료
      setLoading(false);
      return;
    }

    // 중복 요청 취소
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    const { signal } = abortRef.current;

    setLoading(true);
    setError(null);

    try {
      const authHeader = { Authorization: `Bearer ${token}` };

      // 1) 최근 7일 배차, 2) 전체 운전자(관리자 전용)
      const [dispatchRes, driversRes] = await Promise.all([
        axios.get("/api/admin/dispatches", {
          params: { startDate: sevenDaysRange.startStr, endDate: sevenDaysRange.endStr },
          headers: authHeader,
          signal
        }),
        axios.get("/api/admin/drivers", { headers: authHeader, signal })
      ]);

      const dispatches = dispatchRes.data?.data || dispatchRes.data || [];
      const drivers = driversRes.data?.data || driversRes.data || [];

      setDispatches7d(Array.isArray(dispatches) ? dispatches : []);
      setDriversAll(Array.isArray(drivers) ? drivers : []);
    } catch (err) {
      if (axios.isCancel(err)) return; // 취소된 요청 무시
      console.error("[useDashboardData] 데이터 로딩 실패:", err);
      setError(err.response?.data?.message || err.message || "대시보드 데이터 로딩 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 토큰이 준비되면 호출, 날짜 범위가 바뀌어도 호출
    fetchAll();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sevenDaysRange.startStr, sevenDaysRange.endStr, getToken]);

  // 파생값들 메모화
  const todayDispatches = useMemo(() => {
    if (!dispatches7d.length) return [];
    return dispatches7d.filter((d) => getDateStr(d) === todayStr);
  }, [dispatches7d, todayStr]);

  const ongoingCount = useMemo(() => {
    const now = new Date();
    return todayDispatches.filter((d) => {
      const dateStr = getDateStr(d);
      const dep = toDate(dateStr, getDepTimeStr(d));
      const arr = toDate(dateStr, getArrTimeStr(d));
      if (!dep || !arr) return false;
      return now >= dep && now <= arr;
    }).length;
  }, [todayDispatches]);

  // 알림 관련 카운트는 NotificationProvider를 신뢰
  const { unreadCount = 0 } = useNotification?.() || {};

  const kpiCounts = useMemo(() => ({
    totalDrivers: driversAll?.length || 0,
    todayTotal: todayDispatches.length,
    ongoing: ongoingCount,
    unreadNotifications: unreadCount
  }), [driversAll, todayDispatches.length, ongoingCount, unreadCount]);

  const weeklyCounts = useMemo(() => {
    // 최근 7일 date -> count 맵 생성 후 배열로
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const count = dispatches7d.filter((x) => getDateStr(x) === key).length;
      result.push({ date: key, count });
    }
    return result;
  }, [dispatches7d]);

  const hourlyDistribution = useMemo(() => {
    // 최근 7일 전체를 0~23시 버킷으로 카운트
    const buckets = Array.from({ length: 24 }, (_, h) => ({ hour: h, count: 0 }));
    dispatches7d.forEach((d) => {
      const t = getDepTimeStr(d);
      if (!t) return;
      const h = parseInt(t.slice(0, 2), 10);
      if (!Number.isNaN(h) && h >= 0 && h < 24) buckets[h].count += 1;
    });
    return buckets;
  }, [dispatches7d]);

  return {
    // 상태
    loading,
    error,
    refresh: fetchAll,
    // 원시
    driversAll,
    dispatches7d,
    // 파생
    todayDispatches,
    kpiCounts,
    weeklyCounts,
    hourlyDistribution,
    ongoingCount,
    unreadCount,
    // 기간 정보
    range: sevenDaysRange,
    todayStr
  };
};
