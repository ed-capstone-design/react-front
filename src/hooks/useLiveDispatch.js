import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import client from '../api/client';
import { useWebSocket } from '../components/WebSocket/WebSocketProvider';

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

export function useLiveDispatch(dispatchId) {
  const { subscribeDispatchLocation, subscribeDispatchObd } = useWebSocket();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null); // dispatch 기본 정보
  const [latestLocation, setLatestLocation] = useState(null);
  const [latestObd, setLatestObd] = useState(null);
  const locationBufferRef = useRef([]);
  const obdBufferRef = useRef([]);
  const [tick, setTick] = useState(0); // 버퍼 변경 강제 렌더용 경량 state

  // 초기 로드: dispatch 메타 (존재하는 경우)
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!dispatchId) return;
      setLoading(true); setError(null);
      try {
        const res = await client.get(`/api/admin/dispatches/${dispatchId}`);
        // 백엔드 응답 래퍼 형식: { success, message, data: { ...dispatch } }
        const raw = res?.data;
        let detail = raw;
        if (raw && typeof raw === 'object' && 'data' in raw && raw.data) {
          detail = raw.data;
        }
        if (detail && typeof detail === 'object') {
          // timestamp/시간 필드 정규화 (필요 시 확장 여지)
          // 예: scheduledDepartureTime, scheduledArrivalTime 등은 Date 변환을 나중 컴포넌트에서 판단
        }
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

  // 슬라이딩 버퍼 삽입 공통
  const pushBuffer = useCallback((ref, sample, windowMs) => {
    ref.current.push(sample);
    const cutoff = Date.now() - windowMs;
    // timestamp ISO → Date 변환 비용 최소화를 위해 string 그대로 비교 불가 → Date 생성
    while (ref.current.length > 0) {
      const first = ref.current[0];
      const t = new Date(first.timestamp).getTime();
      if (t < cutoff) ref.current.shift(); else break;
    }
  }, []);

  // 구독 설정
  useEffect(() => {
    if (!dispatchId) return;
    // LOCATION
    const unsubLoc = subscribeDispatchLocation(dispatchId, (loc) => {
      const norm = normalizeTimestamp(loc);
      setLatestLocation(norm);
      pushBuffer(locationBufferRef, norm, BUFFER_WINDOWS.location);
      setTick(t => t + 1);
    });
    // OBD
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

  // stale 판단
  const stale = useMemo(() => {
    const now = Date.now();
    let locationStale = false;
    let obdStale = false;
    if (latestLocation) {
      const t = new Date(latestLocation.timestamp).getTime();
      locationStale = now - t > STALE_THRESHOLD_LOCATION;
    } else if (!loading) {
      // 처음부터 전혀 수신 안 되면 일정 시간 후 stale 처리 가능 (선택)
    }
    if (latestObd) {
      const t = new Date(latestObd.timestamp).getTime();
      obdStale = now - t > STALE_THRESHOLD_OBD;
    }
    return { location: locationStale, obd: obdStale };
  }, [latestLocation, latestObd, loading, tick]);

  // KPI 파생 (Phase1: 단순 값)
  const kpis = useMemo(() => {
    return {
      speed: latestObd?.speed ?? latestLocation?.speed ?? null,
      rpm: latestObd?.engineRpm ?? null,
      soc: latestObd?.soc ?? null,
      torque: latestObd?.torque ?? null,
      throttle: latestObd?.throttle ?? null,
      brake: latestObd?.brake ?? null,
      stalled: latestObd?.stalled ?? null,
      lastLocationAgeSec: latestLocation ? ((Date.now() - new Date(latestLocation.timestamp).getTime()) / 1000).toFixed(1) : null,
      lastObdAgeSec: latestObd ? ((Date.now() - new Date(latestObd.timestamp).getTime()) / 1000).toFixed(1) : null,
    };
  }, [latestLocation, latestObd, tick]);

  return {
    loading,
    error,
    meta,
    latestLocation,
    latestObd,
    kpis,
    stale,
    locationSamples: locationBufferRef.current,
    obdSamples: obdBufferRef.current,
  };
}

export default useLiveDispatch;