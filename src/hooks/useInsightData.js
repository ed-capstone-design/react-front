import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useToken } from "../components/Token/TokenProvider";
import { useNotificationContext } from "../Context/NotificationProvider";
import { useWebSocketContext } from "../Context/WebSocketProvider";

/**
 * useInsightData (Status 기반 Insight 전용)
 * 기간: 어제 ~ 내일 (3일)
 * KPI: todayTotal, todayCompleted, todayDelayed, todayRemaining
 * todayRemaining = SCHEDULED + RUNNING + DELAYED (CANCELED/COMPLETED 제외)
 * todayTotal = 오늘 status != CANCELED 전체
 */
export const useInsightData = () => {
  const { getToken } = useToken();
  const { unreadCount = 0 } = useNotificationContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dispatches, setDispatches] = useState([]);
  const abortRef = useRef(null);

  // 날짜 범위 (어제~내일)
  const range = useMemo(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 1);
    const end = new Date(today);
    end.setDate(today.getDate() + 1);
    const toStr = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")}`;
    return { start: toStr(start), end: toStr(end) };
  }, []);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const normalizeDate = (d) => {
    if (d.dispatchDate) return d.dispatchDate;
    if (d.scheduledDeparture) return String(d.scheduledDeparture).slice(0, 10);
    if (d.date) return d.date;
    return null;
  };

  const fetchRange = useCallback(async () => {
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
      // 전체 배차를 받아와서 이후 훅에서 RUNNING만 필터링하도록 함
      // (KPI: 오늘의 모든 상태를 계산하려면 전체 배차가 필요함)
      const res = await axios.get("/api/admin/dispatches", {
        params: { startDate: range.start, endDate: range.end },
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });
      const raw = res.data?.data || res.data || [];
      // Debug: 서버가 어떤 데이터를 반환하는지 확인
      try {
        console.log(
          "[useInsightData] fetched /api/admin/dispatches count:",
          Array.isArray(raw) ? raw.length : "(non-array)",
          raw && Array.isArray(raw) ? raw.slice(0, 3) : raw
        );
      } catch (e) {}
      const list = Array.isArray(raw)
        ? raw.map((r) => ({
            ...r,
            _normDate: normalizeDate(r),
            _normStatus: (r.status || "").toUpperCase(),
          }))
        : [];
      try {
        console.log(
          "[useInsightData] sample normalized:",
          list.slice(0, 3).map((d) => ({
            id: d.dispatchId,
            status: d.status,
            _normStatus: d._normStatus,
            _normDate: d._normDate,
          }))
        );
      } catch (e) {}
      setDispatches(list);
    } catch (e) {
      if (axios.isCancel(e)) return;
      setError(e);
      console.error("[useInsightData] fetch 실패", e);
    } finally {
      setLoading(false);
    }
  }, [getToken, range.start, range.end]);

  useEffect(() => {
    fetchRange();
    return () => abortRef.current?.abort();
  }, [fetchRange]);

  // 오늘 배차
  const todayDispatches = useMemo(
    () => dispatches.filter((d) => d._normDate === todayStr),
    [dispatches, todayStr]
  );

  // 상태별 배열
  const partition = useMemo(() => {
    const m = {
      RUNNING: [],
      SCHEDULED: [],
      DELAYED: [],
      COMPLETED: [],
      CANCELED: [],
      OTHER: [],
    };
    todayDispatches.forEach((d) => {
      const s = d._normStatus;
      if (m[s]) m[s].push(d);
      else m.OTHER.push(d);
    });
    return m;
  }, [todayDispatches]);

  const todayTotal = useMemo(
    () => todayDispatches.filter((d) => d._normStatus !== "CANCELED").length,
    [todayDispatches]
  );
  const todayCompleted = partition.COMPLETED.length;
  const todayDelayed = partition.DELAYED.length;
  const todayRemaining = useMemo(
    () =>
      partition.SCHEDULED.length +
      partition.RUNNING.length +
      partition.DELAYED.length,
    [partition]
  );
  // runningList는 dispatches 중 상태가 RUNNING인 항목으로 정의
  const runningList = useMemo(
    () =>
      (dispatches || []).filter(
        (d) => (d._normStatus || "").toUpperCase() === "RUNNING"
      ),
    [dispatches]
  );

  // 지도 마커 RUNNING 기준
  // liveLocations 및 구독 관리를 위한 state/refs (실시간 위치는 WebSocket 구독으로 채워짐)
  const { subscribeDispatchLocation } = useWebSocketContext();
  const [liveLocations, setLiveLocations] = useState(() => new Map()); // dispatchId -> {lat,lng,ts}
  const subscriptionsRef = useRef(new Map());
  const subscribedIdsRef = useRef(new Set());

  useEffect(() => {
    const nextIds = new Set(
      (runningList || []).map((r) => r.dispatchId).filter(Boolean)
    );

    // 구독 추가
    nextIds.forEach((id) => {
      if (!subscribedIdsRef.current.has(id)) {
        try {
          const off = subscribeDispatchLocation(id, (loc) => {
            setLiveLocations((prev) => {
              const next = new Map(prev);
              let latRaw =
                loc?.latitude ??
                loc?.lat ??
                loc?.location?.latitude ??
                loc?.position?.lat;
              let lngRaw =
                loc?.longitude ??
                loc?.lng ??
                loc?.location?.longitude ??
                loc?.position?.lng;
              let lat =
                typeof latRaw === "string" ? parseFloat(latRaw) : latRaw;
              let lng =
                typeof lngRaw === "string" ? parseFloat(lngRaw) : lngRaw;
              if (!isFinite(lat) || !isFinite(lng)) {
                const coords =
                  loc?.coordinates ??
                  loc?.geometry?.coordinates ??
                  loc?.point ??
                  null;
                if (Array.isArray(coords) && coords.length >= 2) {
                  const maybeLng = parseFloat(coords[0]);
                  const maybeLat = parseFloat(coords[1]);
                  if (isFinite(maybeLat) && isFinite(maybeLng)) {
                    lat = maybeLat;
                    lng = maybeLng;
                  }
                }
              }
              if (isFinite(lat) && isFinite(lng)) {
                next.set(id, {
                  lat: Number(lat),
                  lng: Number(lng),
                  ts: Date.now(),
                });
              }
              return next;
            });
          });
          if (off) {
            subscriptionsRef.current.set(id, off);
            subscribedIdsRef.current.add(id);
          }
        } catch (e) {
          console.warn(
            "[useInsightData] subscribeDispatchLocation failed for",
            id,
            e
          );
        }
      }
    });

    // 구독 제거
    Array.from(subscribedIdsRef.current).forEach((id) => {
      if (!nextIds.has(id)) {
        const off = subscriptionsRef.current.get(id);
        try {
          off && off();
        } catch {}
        subscriptionsRef.current.delete(id);
        subscribedIdsRef.current.delete(id);
        setLiveLocations((prev) => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
      }
    });

    return () => {
      // 컴포넌트 언마운트 시 전체 정리
      subscriptionsRef.current.forEach((off) => {
        try {
          off && off();
        } catch {}
      });
      subscriptionsRef.current.clear();
      subscribedIdsRef.current.clear();
      setLiveLocations(new Map());
    };
  }, [runningList, subscribeDispatchLocation]);

  // markers는 liveLocations 우선으로 사용하고, 없으면 dispatch 필드 사용
  const markers = useMemo(
    () =>
      (runningList || []).map((r) => {
        const live = liveLocations.get(r.dispatchId);
        const lat = live?.lat ?? r.latitude ?? r.lat ?? 37.5665;
        const lng = live?.lng ?? r.longitude ?? r.lng ?? 126.978;
        const nlat = typeof lat === "string" ? parseFloat(lat) : lat;
        const nlng = typeof lng === "string" ? parseFloat(lng) : lng;
        if (!isFinite(nlat) || !isFinite(nlng)) return null;
        return {
          id: r.dispatchId,
          lat: Number(nlat),
          lng: Number(nlng),
          title: r.driverName || r.vehicleNumber || "운행중",
        };
      }),
    [runningList, liveLocations]
  );

  const kpis = { todayTotal, todayCompleted, todayDelayed, todayRemaining };

  // 운행중 배차들에 대한 이벤트 집계
  const [runningEventsStats, setRunningEventsStats] = useState(null);
  const [runningEventsLoading, setRunningEventsLoading] = useState(false);
  const [runningEventsError, setRunningEventsError] = useState(null);

  const loadRunningEventsStats = useCallback(async () => {
    if (!runningList || runningList.length === 0) {
      setRunningEventsStats({});
      return;
    }
    setRunningEventsLoading(true);
    setRunningEventsError(null);
    try {
      const token = getToken && getToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      try {
        console.debug(
          "[useInsightData] loadRunningEventsStats running count:",
          runningList.length,
          runningList.slice(0, 5).map((x) => ({
            dispatchId: x.dispatchId,
            id: x.id,
            dispatch_id: x.dispatch_id,
          }))
        );
      } catch (e) {}
      const requests = runningList.map((r) => {
        const id =
          r.dispatchId ?? r.id ?? r.dispatch_id ?? r.refId ?? r.referenceId;
        if (!id) return Promise.resolve(null);
        return axios
          .get(`/api/admin/dispatches/${id}/driving-record`, { headers })
          .then((res) => res.data?.data || res.data || null)
          .catch((e) => {
            console.warn(
              "[useInsightData] driving-record failed for",
              id,
              e?.message || e
            );
            return null;
          });
      });
      const results = await Promise.all(requests);
      const types = { DROWSINESS: 0, ACCELERATION: 0, BRAKING: 0, ABNORMAL: 0 };
      // driving score aggregation helpers
      let drivingScoreSum = 0;
      let drivingScoreCount = 0;
      const drivingScorePerDispatch = {};

      results.forEach((rec, idx) => {
        if (!rec || typeof rec !== "object") return;
        const drowsiness = Number(
          rec.drowsinessCount ?? rec.drowsiness_count ?? rec.drowsiness ?? 0
        );
        const acceleration = Number(
          rec.accelerationCount ??
            rec.acceleration_count ??
            rec.acceleration ??
            0
        );
        const braking = Number(
          rec.brakingCount ?? rec.braking_count ?? rec.braking ?? 0
        );
        const abnormal = Number(
          rec.abnormalCount ?? rec.abnormal_count ?? rec.abnormal ?? 0
        );
        types.DROWSINESS += Number.isFinite(drowsiness) ? drowsiness : 0;
        types.ACCELERATION += Number.isFinite(acceleration) ? acceleration : 0;
        types.BRAKING += Number.isFinite(braking) ? braking : 0;
        types.ABNORMAL += Number.isFinite(abnormal) ? abnormal : 0;

        // drivingScore may come as drivingScore, driving_score, score
        const score = Number(
          rec.drivingScore ??
            rec.driving_score ??
            rec.score ??
            rec.driving_score_value ??
            NaN
        );
        if (Number.isFinite(score)) {
          drivingScoreSum += score;
          drivingScoreCount += 1;
          // map to dispatch id if present
          const source = runningList[idx];
          const dispatchId =
            source?.dispatchId ??
            source?.id ??
            source?.dispatch_id ??
            source?.refId ??
            source?.referenceId ??
            `idx-${idx}`;
          drivingScorePerDispatch[dispatchId] = score;
        }
      });
      const drivingScoreAverage =
        drivingScoreCount > 0
          ? Math.round((drivingScoreSum / drivingScoreCount) * 10) / 10
          : null; // 1 decimal
      try {
        console.debug("[useInsightData] runningEventsStats computed:", types, {
          drivingScoreAverage,
          drivingScorePerDispatch,
        });
      } catch (e) {}
      setRunningEventsStats({
        ...types,
        drivingScoreAverage,
        drivingScorePerDispatch,
      });
    } catch (e) {
      console.error("[useInsightData] running events aggregation failed", e);
      setRunningEventsError(
        e?.response?.data?.message || e.message || "통계 조회 실패"
      );
    } finally {
      setRunningEventsLoading(false);
    }
  }, [runningList, getToken]);

  const subscribedIds = useMemo(
    () => Array.from(liveLocations.keys()),
    [liveLocations]
  );

  return {
    loading,
    error,
    refresh: fetchRange,
    dispatches,
    todayDispatches,
    runningList,
    markers,
    kpis,
    unreadCount,
    range,
    todayStr,
    partition,
    // realtime helpers
    liveLocations,
    subscribedIds,
    // running events aggregation
    runningEventsStats,
    runningEventsLoading,
    runningEventsError,
    loadRunningEventsStats,
  };
};
