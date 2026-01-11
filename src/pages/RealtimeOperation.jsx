import React from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import useLiveDispatch from '../hooks/useLiveDispatch';
import KakaoMap from '../components/Map/KakaoMapContainer';
import RealtimeMarkers from '../components/Map/RealtimeMarkers';
import { useNotification } from '../components/Notification/contexts/NotificationProvider';
import { useToken } from '../components/Token/TokenProvider';

// RealtimeOperation - Phase 1.5 리디자인
// 구조:
// 1) 상단: 요약 헤더 (배차/운전자/차량 상태 + 상태 배지)
// 2) 본문 2열 (lg 이상):
//    - 좌측 (지도 패널): 경로/현재 위치
//    - 우측 (정보 패널): OBD 테이블, 실시간 KPI 칩, 관련 알림 목록
// 모바일/태블릿에서는 순차적 단일 컬럼으로 스택

const RealtimeOperation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatchId = id;
  const { loading, error, meta, latestLocation, kpis} = useLiveDispatch(dispatchId);
  const [metaLocal, setMetaLocal] = React.useState(null);
  // 운행 이벤트 목록 상태
  const [driveEvents, setDriveEvents] = React.useState([]);
  const [eventLoading, setEventLoading] = React.useState(true);
  const [eventError, setEventError] = React.useState(null);
  const { getAccessToken } = useToken();
  const { version: notificationVersion, notifications } = useNotification();
  const [ending, setEnding] = React.useState(false);
  const [endError, setEndError] = React.useState(null);

  // 이벤트 로드 함수(재사용)
  const fetchEvents = React.useCallback(async () => {
    if (!dispatchId) return;
    setEventLoading(true);
    setEventError(null);
    try {
      const token = getAccessToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`/api/admin/dispatches/${dispatchId}/events`, { headers });
      const data = res.data?.data ?? res.data ?? [];
      setDriveEvents(Array.isArray(data) ? data : [data]);
    } catch (err) {
      setEventError(err.response?.data?.message || err.message || '운행 이벤트 조회 실패');
      setDriveEvents([]);
    } finally {
      setEventLoading(false);
    }
  }, [dispatchId, getAccessToken]);

  // 초기 및 dispatchId 변경 시 최초 로드
  React.useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // 알림이 도착하면 관련 배차에 대한 이벤트를 재요청
  React.useEffect(() => {
    if (!dispatchId) return;
    try {
      // 이전에 본 알림 id 집합을 유지하여 새로 추가된 알림만 처리
      if (!RealtimeOperation._prevNotifIds) RealtimeOperation._prevNotifIds = new Set();
      const prevIds = RealtimeOperation._prevNotifIds;
      const current = Array.isArray(notifications) ? notifications : [];
      const currentIds = new Set(current.map(n => n?.id).filter(Boolean));

      // 새로 추가된 id 목록 계산
      const newIds = Array.from(currentIds).filter(id => !prevIds.has(id));

      // prevIds 갱신
      RealtimeOperation._prevNotifIds = currentIds;

      if (newIds.length === 0) return;

      // 새로 추가된 알림들 중 dispatchId가 현재 dispatchId와 일치하는 것이 있는지 확인
      const related = newIds.some(id => {
        const n = current.find(x => x?.id === id);
        if (!n) return false;
        const nid = n.dispatchId ?? n.dispatchID ?? n.refId ?? n.referenceId ?? n.data?.dispatchId ?? n.payload?.dispatchId ?? null;
        return nid != null && String(nid) === String(dispatchId);
      });

      if (related) {
        fetchEvents();
      }
    } catch (e) {
      console.warn('[RealtimeOperation] 알림 수신 처리 중 오류', e);
    }
  }, [notificationVersion, notifications, dispatchId, fetchEvents]);

  // 지도 마커 (단일)
  const markers = React.useMemo(() => {
    if (!latestLocation) return [];
    const latRaw = latestLocation.latitude ?? latestLocation.lat;
    const lngRaw = latestLocation.longitude ?? latestLocation.lng;
    const lat = Number(latRaw);
    const lng = Number(lngRaw);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return [];
    return [{ id: dispatchId, lat, lng, title: meta?.driverName || '현재 위치' }];
  }, [latestLocation, meta, dispatchId]);

  // 지도 중심 좌표 (사용자 위치 기준)
  const mapCenter = React.useMemo(() => {
    if (!latestLocation) return null;
    const latRaw = latestLocation.latitude ?? latestLocation.lat;
    const lngRaw = latestLocation.longitude ?? latestLocation.lng;
    const lat = Number(latRaw);
    const lng = Number(lngRaw);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  }, [latestLocation]);

  // OBD / KPI 데이터 구성
  const obdRows = React.useMemo(() => [
    { label: '속도', value: fmtNum(kpis.speed, 'km/h') },
    { label: 'RPM', value: fmtNum(kpis.rpm, 'rpm') },
    { label: 'SOC', value: fmtNum(kpis.soc, '%') },
    { label: '토크', value: fmtNum(kpis.torque) },
    { label: '스로틀', value: fmtNum(kpis.throttle, '%') },
    { label: '브레이크', value: fmtNum(kpis.brake, '%') },
    { label: 'Stalled', value: kpis.stalled == null ? '—' : (kpis.stalled ? 'YES' : 'NO') },
    { label: '위치 갱신', value: kpis.lastLocationAgeSec == null ? '—' : `${kpis.lastLocationAgeSec}초 전`, isAge: true },
    { label: 'OBD 갱신', value: kpis.lastObdAgeSec == null ? '—' : `${kpis.lastObdAgeSec}초 전`, isAge: true },
  ], [kpis]);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-5" role="main" aria-label="실시간 운행">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
      >
        <IoArrowBack className="text-lg" />
        <span className="font-medium">뒤로가기</span>
      </button>

      {/* 헤더 */}
      <div className="space-y-3">
        <h1 className="text-2xl font-bold text-gray-900 text-left">실시간 운행</h1>
        <div className="flex items-center flex-wrap gap-3">
          <MetaPill color="indigo" label="운전자" value={(metaLocal || meta)?.driverName || '—'} />
          <MetaPill color="teal" label="차량" value={(metaLocal || meta)?.vehicleNumber || '—'} />
          <StatusPill status={(metaLocal || meta)?.status} />
          {( (metaLocal || meta)?.status !== 'COMPLETED' ) && (
            <button
              onClick={async () => {
                if (!dispatchId) return;
                if (!window.confirm('정말로 이 배차를 종료하시겠습니까?')) return;
                setEnding(true);
                setEndError(null);
                try {
                  const token = getAccessToken();
                  const headers = token ? { Authorization: `Bearer ${token}` } : {};
                  const resp = await axios.patch(`/api/admin/dispatches/${dispatchId}/end`, {}, { headers, timeout: 5000 });
                  const data = resp.data?.data || resp.data;
                  // 반영
                  setMetaLocal(data);
                  console.log('배차 종료 성공', data);
                } catch (e) {
                  console.error('배차 종료 실패', e);
                  setEndError(e.response?.data?.message || e.message || '배차 종료 실패');
                } finally {
                  setEnding(false);
                }
              }}
              disabled={ending}
              className="ml-2 inline-flex items-center gap-2 px-3 py-1 rounded-md bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
            >
              {ending ? '종료 중...' : '배차 종료'}
            </button>
          )}
          {endError && <span className="text-sm text-rose-600 ml-2">{endError}</span>}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm">로드 실패: {String(error.message || error)}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* 좌측 지도 */}
        <section className="lg:col-span-7 bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3" aria-label="지도">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm text-gray-800">경로 / 현재 위치</h2>
            {markers.length === 0 && <span className="text-[11px] text-gray-400">데이터 대기중…</span>}
          </div>
          <div className="relative rounded-lg overflow-hidden ring-1 ring-gray-100">
            <KakaoMap 
              height="480px" 
              center={mapCenter}
              level={4} // 
            >
              <RealtimeMarkers drivers={markers.map(m => ({ lat: m.lat, lng: m.lng, label: m.title, avatar: m.avatar }))} />
            </KakaoMap>
            {markers.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-sm text-gray-500 bg-white/85 backdrop-blur rounded-full px-4 py-1 ring-1 ring-gray-200">위치 데이터 없음</div>
              </div>
            )}
          </div>
        </section>

        {/* 우측 정보 패널 */}
        <aside className="lg:col-span-5 flex flex-col gap-5" aria-label="실시간 데이터 패널">
          {/* OBD 카드 그리드 */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
              <h2 className="font-semibold text-sm text-gray-800">OBD 실시간 데이터</h2>
              {loading && !meta && <span className="text-[11px] text-gray-400">로딩중…</span>}
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {obdRows.map(r => (
                  <div
                    key={r.label}
                    className="group relative rounded-lg border border-gray-200 bg-gray-50/60 hover:bg-white hover:shadow-sm hover:border-sky-200 transition-colors transition-shadow px-3 py-2 flex flex-col gap-1"
                    title={r.isAge ? '마지막 데이터 업데이트 후 경과 시간' : undefined}
                  >
                    <span className="text-[10px] font-medium tracking-wide text-gray-500 group-hover:text-sky-600 transition-colors">
                      {r.label}
                    </span>
                    <span className={`text-[13px] font-semibold tabular-nums tracking-tight ${
                      r.isAge ? 'text-orange-600' : 'text-gray-900'
                    }`}>
                      {r.value}
                    </span>
                    {/* 데이터 갱신 시간 표시 */}
                    {r.isAge && (
                      <span className="absolute top-1.5 right-1.5 inline-flex items-center rounded-full bg-orange-100/80 backdrop-blur px-1.5 py-0.5 ring-1 ring-orange-200 text-[9px] font-semibold text-orange-600 group-hover:ring-orange-300">
                        TIME
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 운행 이벤트 목록 */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col h-full max-h-[360px]">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-sm text-gray-800">운행 이벤트 <span className="ml-1 text-[10px] font-normal text-gray-400">{driveEvents.length}</span></h2>
              {eventLoading && <span className="text-[11px] text-gray-400">로딩중…</span>}
              {!eventLoading && driveEvents.length === 0 && <span className="text-[11px] text-gray-400">없음</span>}
            </div>
            <ul className="flex-1 overflow-auto divide-y divide-gray-100 text-xs">
              {eventError && (
                <li className="px-4 py-10 flex items-center justify-center text-[11px] text-rose-500">{eventError}</li>
              )}
              {!eventLoading && driveEvents.length === 0 && !eventError && (
                <li className="px-4 py-10 flex items-center justify-center text-[11px] text-gray-400">이 배차에 대한 운행 이벤트가 없습니다.</li>
              )}
              {driveEvents.map(ev => (
                <li key={ev.drivingEventId} className="px-4 py-2 hover:bg-sky-50/60 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <TypeBadge type={ev.eventType} />
                        <span className="font-medium text-gray-900">{ev.eventType}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 flex items-center gap-2">
                        <time dateTime={ev.eventTimestamp}>{formatTime(ev.eventTimestamp)}</time>
                        {ev.latitude && ev.longitude && (
                          <span>· {ev.latitude.toFixed(5)}, {ev.longitude.toFixed(5)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default RealtimeOperation;


function fmtNum(v, suffix) {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'number') return `${Math.round(v * 10) / 10}${suffix ? ' ' + suffix : ''}`;
  return String(v);
}


// 알림 타입 뱃지
const TypeBadge = ({ type }) => {
  if (!type) return null;
  const map = {
    // 기존 알림 타입들
    ALERT: 'bg-rose-100 text-rose-700 border-rose-200',
    WARNING: 'bg-amber-100 text-amber-700 border-amber-200',
    DRIVING_WARNING: 'bg-orange-100 text-orange-700 border-orange-200',
    // 새로운 드라이빙 이벤트 타입들
    DROWSINESS: 'bg-red-100 text-red-700 border-red-200',
    ACCELERATION: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    BRAKING: 'bg-orange-100 text-orange-700 border-orange-200',
    SMOKING: 'bg-purple-100 text-purple-700 border-purple-200',
    SEATBELT_UNFASTENED: 'bg-blue-100 text-blue-700 border-blue-200',
    PHONE_USAGE: 'bg-pink-100 text-pink-700 border-pink-200',
  };
  const cls = map[type] || 'bg-gray-100 text-gray-600 border-gray-200';
  
  // 타입별 한글 라벨
  const labels = {
    ALERT: 'ALERT',
    WARNING: 'WARNING', 
    DRIVING_WARNING: 'DRIVING_WARNING',
    DROWSINESS: '졸음운전',
    ACCELERATION: '급가속',
    BRAKING: '급제동',
    SMOKING: '흡연',
    SEATBELT_UNFASTENED: '안전벨트',
    PHONE_USAGE: '휴대폰사용',
  };
  
  const label = labels[type] || type;
  return <span className={`inline-flex items-center h-5 px-2 rounded-full text-[10px] font-semibold border ${cls}`}>{label}</span>;
};

function formatTime(d) {
  if (!d) return '—';
  try {
    const date = d instanceof Date ? d : new Date(d);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch { return '—'; }
}



// 메타 정보 배지 컴포넌트
const MetaPill = ({ label, value, color = 'gray' }) => {
  const tone = metaTone(color);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[12px] font-medium ${tone.Abg} ${tone.border} ${tone.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} aria-hidden />
      <span className="opacity-70">{label}</span>
      <strong className="font-semibold tracking-tight">{value}</strong>
    </span>
  );
};

function metaTone(color) {
  const map = {
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', dot: 'bg-indigo-500' },
    teal: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', dot: 'bg-teal-500' },
    sky: { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-700', dot: 'bg-sky-500' },
    rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    gray: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', dot: 'bg-gray-400' },
  };
  return map[color] || map.gray;
}

// 상태 Pill
const StatusPill = ({ status }) => {
  if (!status) return <MetaPill label="상태" value="—" color="gray" />;
  const normalized = status.toUpperCase();
  const color = (
    normalized.includes('RUN') ? 'emerald' :
    normalized.includes('COMP') ? 'indigo' :
    normalized.includes('CANCEL') ? 'rose' :
    'gray'
  );
  return <MetaPill label="상태" value={status} color={color} />;
};

