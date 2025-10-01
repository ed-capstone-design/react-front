import axios from 'axios';
import { useToken } from '../components/Token/TokenProvider';

export const useDriveDetailAPI = () => {
  const { getToken } = useToken();

  // 단일 Admin 엔드포인트만 사용 (요구사항 반영)
  const authHeaders = () => {
    const token = getToken && getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // driving-record에서 경로 좌표를 유추해서 꺼내기 위한 헬퍼
  const deriveLocationsFromRecord = (record) => {
    if (!record || typeof record !== 'object') return [];
    // 후보 키들: locations, route, points, coordinates 등
    const candidates = [
      record.locations,
      record.route,
      record.points,
      record.coordinates,
      record.path,
    ].filter(Boolean);
    for (const c of candidates) {
      if (Array.isArray(c) && c.length) {
        // 원소가 {latitude, longitude} or {lat, lng} 형태라고 가정
        return c.map((p) => ({
          latitude: Number(p.latitude ?? p.lat),
          longitude: Number(p.longitude ?? p.lng),
        })).filter((p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude));
      }
    }
    return [];
  };

  // 운행 경로(위치) 조회
  const fetchDriveLocations = async (dispatchId) => {
    // 전용 locations API 없이 driving-record에서 경로를 추출
    const headers = authHeaders();
    const res = await axios.get(`/api/admin/dispatches/${dispatchId}/driving-record`, { headers });
    const data = res.data?.data ?? res.data ?? null;
    return deriveLocationsFromRecord(data);
  };

  // 운행 이벤트 조회
  const fetchDriveEvents = async (dispatchId) => {
    const headers = authHeaders();
    const res = await axios.get(`/api/admin/dispatches/${dispatchId}/events`, { headers });
    return res.data?.data ?? res.data ?? [];
  };

  // 운행 기록(요약) 조회
  const fetchDriveRecord = async (dispatchId) => {
    const headers = authHeaders();
    const res = await axios.get(`/api/admin/dispatches/${dispatchId}/driving-record`, { headers });
    return res.data?.data ?? res.data ?? null;
  };

  return {
    fetchDriveLocations,
    fetchDriveEvents,
    fetchDriveRecord,
  };
};
