import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useInsightData } from '../hooks/useInsightData';
import { useWebSocket } from '../components/WebSocket/WebSocketProvider';
import { useNotification } from '../components/Notification/contexts/NotificationProvider';
import axios from 'axios';
import { useToken } from '../components/Token/TokenProvider';
import KakaoMap from '../components/Map/Map';

// Insight 페이지: status 기반 KPI (금일 배차 / 완료 / 지연 / 남은) + RUNNING 리스트 + 알림 + 지도

const Insight = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount } = useNotification();
  const { isConnected } = useWebSocket();
  const { subscribeDispatchLocation } = useWebSocket();
  const {
    loading,
    kpis,
    runningList,
    refresh,
  } = useInsightData();
  const { getToken } = useToken();

  // 알림 페이지네이션 (탭 내부에서 사용)
  const [page, setPage] = React.useState(1);
  const pageSize = 5; // 디자인: 한 화면에 보이는 알림 수
  const totalPages = Math.ceil((notifications?.length || 0) / pageSize);
  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages || 1);
  }, [totalPages, page]);
  const pagedNotifications = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return (notifications || []).slice(start, start + pageSize);
  }, [notifications, page]);

  // 우측 패널 탭 전환 (운행/알림)
  const [activeTab, setActiveTab] = React.useState('running'); // 'running' | 'notifications'

  // status 기반 RUNNING 목록
  const running = runningList;

  // 다중 위치 구독 관리 (running 목록 변동 시 구독/해제)
  // 서버 주기(현재 10초, 향후 1초)가 변해도 구조 유지. 최신 좌표만 마커용 state 로 보관.
  const [liveLocations, setLiveLocations] = React.useState(() => new Map()); // dispatchId -> {lat,lng,ts}
  const subscriptionsRef = React.useRef(new Map()); // dispatchId -> unsubscribe fn
  const subscribedIdsRef = React.useRef(new Set());

  React.useEffect(() => {
    const nextIds = new Set(running.map(r => r.dispatchId).filter(Boolean));

    // 구독 추가 (신규)
    nextIds.forEach(id => {
      if (!subscribedIdsRef.current.has(id)) {
        const off = subscribeDispatchLocation(id, (loc) => {
          setLiveLocations(prev => {
            const next = new Map(prev);
            const lat = loc.latitude ?? loc.lat;
            const lng = loc.longitude ?? loc.lng;
            if (typeof lat === 'number' && typeof lng === 'number') {
              next.set(id, { lat, lng, ts: Date.now() });
            }
            return next;
          });
        });
        if (off) {
          subscriptionsRef.current.set(id, off);
          subscribedIdsRef.current.add(id);
        }
      }
    });

    // 구독 제거 (더 이상 필요 없는 id)
    Array.from(subscribedIdsRef.current).forEach(id => {
      if (!nextIds.has(id)) {
        const off = subscriptionsRef.current.get(id);
        try { off && off(); } catch {}
        subscriptionsRef.current.delete(id);
        subscribedIdsRef.current.delete(id);
        setLiveLocations(prev => {
          const next = new Map(prev);
          next.delete(id);
            return next;
        });
      }
    });

    // 언마운트 시 전체 해제
    return () => {
      if (nextIds.size === 0) { // 컴포넌트 unmount 추정
        subscriptionsRef.current.forEach(off => { try { off && off(); } catch {} });
        subscriptionsRef.current.clear();
        subscribedIdsRef.current.clear();
        setLiveLocations(new Map());
      }
    };
  }, [running, subscribeDispatchLocation]);

  // 지도 마커 (레거시: 실시간 운행중 배차만 표시)
  const markers = React.useMemo(() => {
    return running.map(r => {
      const live = liveLocations.get(r.dispatchId);
      return {
        id: r.dispatchId,
        lat: live?.lat ?? r.latitude ?? r.lat ?? 37.5665,
        lng: live?.lng ?? r.longitude ?? r.lng ?? 126.9780,
        title: r.driverName || r.vehicleNumber || '운행중'
      };
    });
  }, [running, liveLocations]);

  // 알림 helper
  const formatDateTime = (d) => {
    try {
      const dt = typeof d === 'string' ? new Date(d) : d;
      return dt.toLocaleString();
    } catch { return d; }
  };

  // 알림 읽음 처리 (legacy: NotificationProvider의 markAsRead 사용 기대)
  const { markAsRead } = useNotification();

  // 알림 항목 클릭: 읽음 처리 후 URL 이동(optional)
  const [statsModalOpen, setStatsModalOpen] = React.useState(false);
  const [statsLoading, setStatsLoading] = React.useState(false);
  const [statsError, setStatsError] = React.useState(null);
  const [statsData, setStatsData] = React.useState(null);
  const [runningEventsStats, setRunningEventsStats] = React.useState(null);
  const [runningEventsLoading, setRunningEventsLoading] = React.useState(false);
  const [runningEventsError, setRunningEventsError] = React.useState(null);

  const fetchDispatchEventStats = async (dispatchId) => {
    setStatsLoading(true);
    setStatsError(null);
    setStatsData(null);
    try {
      const token = getToken?.();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`/api/admin/dispatches/${dispatchId}/events`, { headers });
      const raw = res.data?.data || res.data || [];
      // Backend DrivingEventType enum (ensure keys match exactly)
      const EVENT_TYPES = [
        'DROWSINESS',
        'ACCELERATION',
        'BRAKING',
        'SMOKING',
        'SEATBELT_UNFASTENED',
        'PHONE_USAGE'
      ];
      const types = EVENT_TYPES.reduce((acc, k) => { acc[k] = 0; return acc; }, {});
      // Count occurrences; ignore unknown types but keep them collectable under 'UNKNOWN' if desired
      raw.forEach(ev => {
        const t = (ev.eventType || ev.type || '').toString();
        if (!t) return;
        if (Object.prototype.hasOwnProperty.call(types, t)) {
          types[t] += 1;
        } else {
          // optional: track unknown types under a special key
          types.UNKNOWN = (types.UNKNOWN || 0) + 1;
        }
      });
      setStatsData(types);
    } catch (e) {
      console.error('[Insight] dispatch events fetch failed', e);
      setStatsError(e.response?.data?.message || e.message || '이벤트 조회 실패');
    } finally {
      setStatsLoading(false);
      setStatsModalOpen(true);
    }
  };

  const handleNotificationClick = async (n) => {
    if (!n.isRead) {
      markAsRead(n.id);
    }
    const dispatchId = n.dispatchId || n.dispatchID || n.dispatch_id || n.refId || n.referenceId;
    if (dispatchId) {
      // 읽음 처리 후 리얼타임 페이지로 이동 (요청하신 플로우)
      navigate(`/realtime-operation/${dispatchId}`);
      return;
    }
    if (n.url) {
      navigate(n.url);
      return;
    }
    // 기타 알림은 통계 모달로 열어주기
    await fetchDispatchEventStats(n.relatedDispatchId || n.refId || n.referenceId);
  };

  // runningList 기반으로 모든 운행중 배차들의 이벤트를 합산한 통계 조회
  React.useEffect(() => {
    const load = async () => {
      if (activeTab !== 'notifications') return;
      if (!running || running.length === 0) {
        setRunningEventsStats({});
        return;
      }
      setRunningEventsLoading(true);
      setRunningEventsError(null);
      try {
        const token = getToken?.();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const requests = running.map(r => axios.get(`/api/admin/dispatches/${r.dispatchId}/events`, { headers }).then(res => res.data?.data || res.data || []).catch(e => {
          console.warn('[Insight] dispatch events load failed for', r.dispatchId, e?.message || e);
          return [];
        }));
        const results = await Promise.all(requests);
        const types = {
          DROWSINESS: 0,
          ACCELERATION: 0,
          BRAKING: 0,
          SMOKING: 0,
          SEATBELT_UNFASTENED: 0,
          PHONE_USAGE: 0,
        };
        results.flat().forEach(ev => {
          const t = (ev.eventType || ev.type || '').toString();
          if (t && Object.prototype.hasOwnProperty.call(types, t)) types[t] += 1;
        });
        setRunningEventsStats(types);
      } catch (e) {
        console.error('[Insight] running events aggregation failed', e);
        setRunningEventsError(e.response?.data?.message || e.message || '통계 조회 실패');
      } finally {
        setRunningEventsLoading(false);
      }
    };
    load();
  }, [activeTab, running, getToken]);

  return (
  <div className="max-w-7xl mx-auto p-3 md:p-4 space-y-4" role="main" aria-label="인사이트 메인">
      {/* TOP: 동적 지표 (운행 탭: 배차 KPI, 알림 탭: 경고 통계) */}
      <section aria-label="상단 지표" className="space-y-2">
        <header className="flex items-center gap-2 flex-wrap">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight text-left">인사이트</h2>
        </header>
        {activeTab === 'running' ? (
          <div className="flex flex-wrap items-center gap-1.5" aria-label="배차 KPI">
            <InlineKpi loading={loading} label="금일 총 배차" value={kpis?.todayTotal} tone="indigo" />
            <InlineKpi loading={loading} label="금일 완료" value={kpis?.todayCompleted} tone="emerald" />
            <InlineKpi loading={loading} label="금일 지연" value={kpis?.todayDelayed} tone="rose" />
            <InlineKpi loading={loading} label="남은 배차" value={kpis?.todayRemaining} tone="blue" />
          </div>
        ) : (
          <TypeSummary notifications={notifications} compact />
        )}
      </section>

      {/* 통계 모달 */}
      {statsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">운행 이벤트 통계</h3>
              <button onClick={() => setStatsModalOpen(false)} className="text-sm text-gray-500">닫기</button>
            </div>
            {statsLoading ? (
              <div className="py-6 text-center">로딩중…</div>
            ) : statsError ? (
              <div className="py-6 text-center text-rose-600">{statsError}</div>
            ) : statsData ? (
              <div className="space-y-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500">
                      <th>이벤트 타입</th>
                      <th className="text-right">수량</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(statsData).map(([k, v]) => {
                      // map backend enum keys to human-friendly labels
                      const labelMap = {
                        DROWSINESS: '졸음',
                        ACCELERATION: '급가속',
                        BRAKING: '급제동',
                        SMOKING: '흡연',
                        SEATBELT_UNFASTENED: '안전벨트 미착용',
                        PHONE_USAGE: '휴대폰 사용',
                        UNKNOWN: '알 수 없는 타입'
                      };
                      const label = labelMap[k] || k;
                      return (
                        <tr key={k} className="border-t">
                          <td className="py-2">{label}</td>
                          <td className="py-2 text-right font-semibold">{v}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-6 text-center text-gray-500">데이터 없음</div>
            )}
          </div>
        </div>
      )}

    {/* 지도 + 우측 패널(탭: 운행 / 알림)
      비율 다시 조정: 요청된 70:30 → 10컬럼 기반 (map 7, panel 3)
      - 모바일: 단일 컬럼
      - lg 이상: grid-cols-10 / 지도 col-span-7 / 패널 col-span-3
      - 기존 4:1 과도 확대를 대체하고 패널 가독성 확보 */}
  <section className="grid grid-cols-1 lg:grid-cols-10 gap-4 items-start">
        {/* 지도 */}
  <div className="lg:col-span-7 bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-4 transition-[width]">

          <div className="relative rounded-xl overflow-hidden ring-1 ring-gray-100">
            <KakaoMap markers={markers} height="420px" />
            {markers.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-sm text-gray-500 bg-white/80 backdrop-blur rounded-full px-4 py-1 ring-1 ring-gray-200">실시간 위치 없음</div>
              </div>
            )}
          </div>
        </div>
    {/* 우측 패널: 30% 영역 (col-span-3) */}
  <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-0 flex flex-col h-full min-w-0">
          {/* 탭 헤더 */}
            <div className="flex items-stretch border-b border-gray-200 overflow-hidden rounded-t-xl">
              <TabButton
                active={activeTab === 'running'}
                onClick={() => setActiveTab('running')}
                label={`운행 중: ${running.length}`}
                icon={<span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
              />
              <TabButton
                active={activeTab === 'notifications'}
                onClick={() => setActiveTab('notifications')}
                label={`알림 · 미읽음 ${unreadCount}`}
                icon={<span className="w-2 h-2 rounded-full bg-sky-500" />}
              />
            </div>
            {/* 탭 내용 */}
            {/* 패널 높이 지도(420px)와 동기화 */}
            <div className="relative flex-1 h-[420px]">
              {/* Running Panel */}
              <FadePanel show={activeTab === 'running'}>
                <div className="p-3 md:p-4 h-full flex flex-col overflow-hidden">
                  {running.length === 0 ? (
                    <div className="text-gray-400 text-sm text-center py-10">실시간 운행중인 배차가 없습니다.</div>
                  ) : (
                    <div className="flex-1 overflow-hidden">
                      <div className="h-full flex flex-col border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm">
                        <ul className="space-y-1.5 pr-1 flex-1 overflow-y-auto p-1.5">
                          {running.map(d => (
                            <li key={d.dispatchId} className="flex items-center justify-between p-1.5 rounded-md hover:bg-gray-50 transition-colors">
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                  {d.driverName || '운전자'}
                                </div>
                                <div className="text-xs text-gray-500">{d.vehicleNumber || '차량'}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                                  onClick={() => navigate(`/realtime-operation/${d.dispatchId}`)}
                                >운행중</button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </FadePanel>
              {/* Notifications Panel (운전자 리스트 스타일 적용) */}
              <FadePanel show={activeTab === 'notifications'}>
                <div className="p-3 md:p-4 h-full flex flex-col overflow-hidden">
                  {pagedNotifications.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-sm text-gray-500">알림이 없습니다.</div>
                  ) : (
                    <div className="flex-1 overflow-hidden mt-1">
                      <div className="h-full flex flex-col border border-gray-200 rounded-lg bg-white/80 backdrop-blur-sm">
                        <ul className="space-y-1.5 pr-1 flex-1 overflow-y-auto p-1.5">
                          {pagedNotifications.map(n => {
                            const unread = !n.isRead;
                            return (
                              <li
                                key={n.id}
                                tabIndex={0}
                                onClick={() => handleNotificationClick(n)}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNotificationClick(n); } }}
                                className={`group flex items-start justify-between p-2 rounded-md cursor-pointer transition-colors
                                  ${unread ? 'bg-sky-50 hover:bg-sky-100' : 'hover:bg-gray-50'}`}
                              >
                                <div className="min-w-0 flex-1 pr-3">
                                  <div className="flex items-center gap-1">
                                    <span className={`w-1.5 h-1.5 rounded-full ${unread ? 'bg-sky-500' : 'bg-gray-300'}`}></span>
                                    <span className="text-[13px] text-gray-900 leading-snug line-clamp-2 break-words">{n.message || '알림'}</span>
                                  </div>
                                  <div className="text-[11px] text-gray-500 mt-1">{formatDateTime(n.createdAt)}</div>
                                </div>
                                {/* '이동' 라벨 제거 (요청사항) */}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  )}
                  {totalPages > 1 && (
                    <div className="mt-3 flex items-center justify-end gap-3">
                      <div className="text-xs text-gray-500">페이지 {totalPages === 0 ? 0 : page} / {totalPages || 0}</div>
                      <div className="flex items-center gap-1">
                        <button
                          className="px-2 py-1 text-xs rounded-lg bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={totalPages === 0 || page <= 1}
                        >이전</button>
                        <button
                          className="px-2 py-1 text-xs rounded-lg bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          disabled={totalPages === 0 || page >= totalPages}
                        >다음</button>
                      </div>
                    </div>
                  )}
                </div>
              </FadePanel>
            </div>
        </div>
      </section>
    </div>
  );
};

export default Insight;

// 경고 유형 통계 - KPI 칩 스타일로 재구성
const TypeSummary = ({ notifications, compact = false }) => {
  const data = React.useMemo(() => {
    const c = { Acceleration: 0, Drowsiness: 0, Braking: 0, Abnormal: 0 };
    notifications.forEach(n => {
      const t = n.warningType || n.type;
      if (t && c.hasOwnProperty(t)) c[t] += 1;
    });
    const total = Object.values(c).reduce((a,b)=>a+b,0);
    return { c, total };
  }, [notifications]);
  const { c, total } = data;
  const gapClass = compact ? 'gap-1.5' : 'gap-2';
  return (
    <div className={`flex flex-wrap items-center ${gapClass}`} aria-label="경고 유형 요약">
      <InlineKpi label="전체 경고" value={total} tone="indigo" small={compact} />
      <InlineKpi label="급가속" value={c.Acceleration} tone="red" small={compact} />
      <InlineKpi label="졸음" value={c.Drowsiness} tone="orange" small={compact} />
      <InlineKpi label="급제동" value={c.Braking} tone="rose" small={compact} />
      <InlineKpi label="이상" value={c.Abnormal} tone="blue" small={compact} />
    </div>
  );
};

// Compact inline KPI Chip
const InlineKpi = ({ loading, label, value, tone = 'indigo', small = false }) => {
  const tones = {
    indigo: {
      base: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      dot: 'bg-indigo-500'
    },
    emerald: {
      base: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500'
    },
    rose: {
      base: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500'
    },
    blue: {
      base: 'bg-blue-50 text-blue-700 border-blue-200',
      dot: 'bg-blue-500'
    },
    red: {
      base: 'bg-red-50 text-red-700 border-red-200',
      dot: 'bg-red-500'
    },
    orange: {
      base: 'bg-orange-50 text-orange-700 border-orange-200',
      dot: 'bg-orange-500'
    }
  };
  const t = tones[tone] || tones.indigo;
  const sizeCls = small
    ? 'gap-1 pl-1.5 pr-2 py-0.5 text-[11px]'
    : 'gap-1.5 pl-2 pr-3 py-1 text-xs';
  const valueCls = small ? 'text-[13px]' : 'text-sm';
  return (
    <div className={`inline-flex items-center rounded-full border font-medium shadow-sm ${t.base} ${sizeCls}`}>
      <span className={`rounded-full ${small ? 'w-1 h-1' : 'w-1.5 h-1.5'} ${t.dot}`}></span>
      <span className="opacity-80 truncate max-w-[90px]">{label}</span>
      <span className={`font-bold tracking-tight ${valueCls}`}>{loading ? '—' : value}</span>
    </div>
  );
};

// 탭 버튼
const TabButton = ({ active, onClick, label, icon }) => (
  <button
    type="button"
    onClick={onClick}
    role="tab"
    aria-selected={active}
    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition-colors relative focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
      ${active ? 'bg-white text-gray-900 border-blue-500' : 'bg-gray-50 text-gray-500 border-transparent hover:text-gray-700'}
    `}
  >
    {icon}
    <span className="truncate max-w-[140px]">{label}</span>
    {active && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500" />}
  </button>
);

// 페이드 패널 (간단 전환)
const FadePanel = ({ show, children }) => (
  <div
    className={`absolute inset-0 transition-opacity duration-300 ease-out ${show ? 'opacity-100 relative' : 'opacity-0 pointer-events-none'}`}
    aria-hidden={!show}
  >
    {children}
  </div>
);
