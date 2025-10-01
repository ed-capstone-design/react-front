import React from "react";
import { useNavigate } from "react-router-dom";
import { IoPeopleOutline, IoCalendarOutline, IoCheckmarkCircleOutline, IoTimeOutline } from "react-icons/io5";
import { useWebSocket } from '../components/WebSocket/WebSocketProvider';
import { useNotification } from '../components/Notification/NotificationProvider';
import { useDashboardData } from "../hooks/useDashboardData";
import KakaoMap from "../components/Map/Map";
import { useToken } from "../components/Token/TokenProvider";
import DriverListPanel from "../components/Driver/DriverListPanel";

const Insight = () => {
  const navigate = useNavigate();
  const { isConnected, subscribeDispatchLocation, subscribedDestinations } = useWebSocket();
  const { getUserInfo, getUserInfoFromToken } = useToken();
  const roles = (getUserInfo()?.roles || getUserInfoFromToken()?.roles || []);
  const isAdmin = roles.includes('ROLE_ADMIN') || roles.includes('ADMIN');
  const { notifications, unreadCount, markAsRead } = useNotification();
  const { loading, kpiCounts, todayDispatches, ongoingCount, dispatches7d } = useDashboardData();

  // 금일 완료/남은 계산
  const now = new Date();
  const parseTime = (timeStr) => {
    if (!timeStr) return "00:00:00";
    return timeStr.length === 5 ? `${timeStr}:00` : timeStr; // HH:mm -> HH:mm:ss
  };
  const completedCount = React.useMemo(() => {
    return todayDispatches.filter((d) => {
      const end = new Date(`${d.dispatchDate}T${parseTime(d.arrivalTime)}`);
      return end && end < now;
    }).length;
  }, [todayDispatches, now]);

  const remainingCount = React.useMemo(() => {
    return todayDispatches.filter((d) => {
      const start = new Date(`${d.dispatchDate}T${parseTime(d.departureTime)}`);
      return start && start > now;
    }).length;
  }, [todayDispatches, now]);

  // 실시간 운전자 위치 상태
  const [driverLocations, setDriverLocations] = React.useState([]);
  // destination -> unsubscribe 함수 매핑 (증분 관리용)
  // 키를 '/topic/dispatch/{id}/location' 문자열로 고정해 숫자/문자 id 혼용으로 인한 진동을 방지
  const dispatchUnsubsRef = React.useRef(new Map());

  // 구독: 최근 7일 중 상태가 RUNNING/DRIVING인 모든 배차의 실시간 위치
  // NOTE: 실시간 WS 구독은 Insight에서만 수행합니다.
  //       DriveDetail(완료 배차 상세)는 REST 데이터(경로/이벤트/기록)만 사용합니다.
  React.useEffect(() => {
    // ADMIN 전용 토픽이면 권한 없을 때 건너뜀
    if (!isAdmin) return;

    // 상태 판정 유틸 (백엔드 필드명 변동 대비)
    const getStatus = (d) => String(d?.status || d?.state || '').toUpperCase();
    const isRunning = (d) => {
      const s = getStatus(d);
      return s === 'RUNNING' || s === 'DRIVING';
    };

    const running = (dispatches7d || []).filter(isRunning);
    // 목적지 문자열로 키를 통일
    const toDest = (d) => {
      const raw = d?.id ?? d?.dispatchId;
      if (raw === undefined || raw === null) return null;
      const idStr = String(raw);
      return `/topic/dispatch/${idStr}/location`;
    };
    const targetDests = new Set(
      running.map(toDest).filter(Boolean)
    );

    // 1) 신규 대상: 구독 추가
    targetDests.forEach((dest) => {
      if (!dispatchUnsubsRef.current.has(dest)) {
        // dest에서 id만 추출
        const idForSub = dest.split('/')[3]; // ['','topic','dispatch','{id}','location']
        const unsub = subscribeDispatchLocation(idForSub, (locationData) => {
          // 디버그 로그
          console.log('[Insight] 위치 수신:', idForSub, locationData);
          setDriverLocations(prev => {
            const idx = prev.findIndex(l => l.dispatchId === locationData.dispatchId);
            const enriched = { ...locationData, lastUpdated: Date.now() };
            if (idx !== -1) {
              const updated = [...prev];
              updated[idx] = enriched;
              return updated;
            } else {
              return [...prev, enriched];
            }
          });
        });
        if (unsub) {
          dispatchUnsubsRef.current.set(dest, unsub);
          console.log('[Insight] 구독 추가:', dest);
        }
      }
    });

    // 2) 제외 대상: 구독 해제
    Array.from(dispatchUnsubsRef.current.keys()).forEach((dest) => {
      if (!targetDests.has(dest)) {
        const unsub = dispatchUnsubsRef.current.get(dest);
        try { unsub && unsub(); } catch {}
        dispatchUnsubsRef.current.delete(dest);
        console.log('[Insight] 구독 해제(제외):', dest);
      }
    });

    // 의존성 변경 시에는 차집합 기반으로만 추가/해제 처리하고,
    // 전체 해제는 언마운트 전용 effect에서 수행합니다.
    return undefined;
  }, [dispatches7d, subscribeDispatchLocation, isAdmin]);

  // 언마운트 시 전체 구독 정리 (한 번만)
  React.useEffect(() => {
    return () => {
      Array.from(dispatchUnsubsRef.current.values()).forEach((u) => {
        try { u && u(); } catch {}
      });
      dispatchUnsubsRef.current.clear();
    };
  }, []);

  // 지도 마커: 실시간 위치로 변환
  const markers = React.useMemo(() =>
    driverLocations.map(loc => ({
      lat: Number(loc.latitude),
      lng: Number(loc.longitude),
      label: loc.driverName,
      vehicleNumber: loc.vehicleNumber,
      imageSrc: 'https://cdn-icons-png.flaticon.com/512/61/61231.png', // 차량 아이콘
    })),
    [driverLocations]
  );

  // 실시간 추적 중 운전자 리스트 (최근 업데이트 순)
  const liveDrivers = React.useMemo(() => {
    const uniq = new Map(); // dispatchId 기준으로 고유화
    driverLocations.forEach((l) => {
      uniq.set(l.dispatchId, l);
    });
    return Array.from(uniq.values()).sort((a, b) => (b.lastUpdated || 0) - (a.lastUpdated || 0));
  }, [driverLocations]);

  // 최신 알림 정렬(최신순) + 페이지네이션
  const [page, setPage] = React.useState(1);
  const pageSize = 10;
  const sortedNotifications = React.useMemo(
    () => [...notifications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [notifications]
  );
  const totalPages = React.useMemo(() => {
    const t = Math.ceil(sortedNotifications.length / pageSize);
    return t;
  }, [sortedNotifications.length]);
  React.useEffect(() => {
    // 알림 갯수 변화 시 현재 페이지 경계 보정
    if (totalPages === 0) {
      if (page !== 1) setPage(1);
      return;
    }
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [totalPages]);
  const pagedNotifications = React.useMemo(() => {
    if (totalPages === 0) return [];
    const start = (page - 1) * pageSize;
    return sortedNotifications.slice(start, start + pageSize);
  }, [sortedNotifications, page, totalPages]);

  const formatDateTime = (d) => new Date(d).toLocaleString('ko-KR', {
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-2 md:px-6">
      {/* 연결 상태 */}
      <div className="flex justify-end items-center mb-6">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
          isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          실시간 연결 {isConnected ? '활성' : '비활성'}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-0 md:p-8 flex flex-col gap-8">
        {/* KPI 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 px-2 md:px-0 pt-6">
          <div className="flex flex-col items-center bg-blue-50 rounded-xl p-4 shadow-sm">
            <IoPeopleOutline className="text-blue-600 text-2xl mb-1" />
            <div className="text-xs font-semibold text-blue-700">전체 운전자</div>
            <div className="text-lg font-extrabold text-blue-800">{loading ? '—' : kpiCounts.totalDrivers}</div>
          </div>
          <div className="flex flex-col items-center bg-indigo-50 rounded-xl p-4 shadow-sm">
            <IoCalendarOutline className="text-indigo-600 text-2xl mb-1" />
            <div className="text-xs font-semibold text-indigo-700">금일 배차</div>
            <div className="text-lg font-extrabold text-indigo-800">{loading ? '—' : kpiCounts.todayTotal}</div>
          </div>
          <div className="flex flex-col items-center bg-green-50 rounded-xl p-4 shadow-sm">
            <IoCheckmarkCircleOutline className="text-green-600 text-2xl mb-1" />
            <div className="text-xs font-semibold text-green-700">금일 완료</div>
            <div className="text-lg font-extrabold text-green-800">{loading ? '—' : completedCount}</div>
          </div>
          <div className="flex flex-col items-center bg-amber-50 rounded-xl p-4 shadow-sm">
            <IoTimeOutline className="text-amber-600 text-2xl mb-1" />
            <div className="text-xs font-semibold text-amber-700">남은 배차</div>
            <div className="text-lg font-extrabold text-amber-800">{loading ? '—' : remainingCount}</div>
          </div>
        </div>

        {/* 지도 + 운행중 운전자 패널 */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <h3 className="text-lg font-bold mb-3 text-gray-900">실시간 지도</h3>
              <div className="relative">
                <KakaoMap markers={markers} height="420px" />
                {markers.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-sm text-gray-500 bg-white/70 backdrop-blur rounded-full px-3 py-1 ring-1 ring-gray-200">
                      위치 연동 준비 중입니다
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="min-h-[420px]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900">운행중 운전자(실시간)</h3>
                <div className="text-xs text-gray-500">{liveDrivers.length}명</div>
              </div>
              <div className="bg-white rounded-xl ring-1 ring-gray-100 h-[420px] overflow-hidden">
                <div className="h-full overflow-y-auto px-3 py-2 custom-scrollbar">
                  {liveDrivers.length === 0 ? (
                    <div className="text-xs text-gray-400">실시간으로 수신 중인 운전자가 없습니다.</div>
                  ) : (
                    <ul className="space-y-2">
                      {liveDrivers.map((d) => (
                        <li key={d.dispatchId} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{d.driverName || '운전자'}</div>
                            <div className="text-xs text-gray-500">{d.vehicleNumber || '차량'}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700">LIVE</span>
                            <button
                              className="text-xs text-blue-600 hover:text-blue-800 underline"
                              onClick={() => navigate(`/drivedetail/${d.dispatchId}`)}
                            >상세</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              {/* 구독 배차 힌트 (선택) */}
              <div className="mt-2 text-[11px] text-gray-400">구독 중: {subscribedDestinations.filter(x => x.includes('/topic/dispatch/')).length}개</div>
            </div>
          </div>
        </section>

        {/* 최신 알림 리스트 + 유형별 통계 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-900">알림 목록</h3>
            <div className="text-sm text-gray-500">미읽음 {unreadCount}개</div>
          </div>

          {/* 4개 유형별 통계 배너 */}
          <TypeSummary notifications={notifications} />

          <div className="border border-gray-200 rounded-xl divide-y">
            {pagedNotifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">알림이 없습니다.</div>
            ) : pagedNotifications.map((n) => (
              <div key={n.id} className={`p-3 flex items-start justify-between ${n.isRead ? 'bg-white' : 'bg-sky-50'}`}>
                <div className="flex-1 pr-3">
                  <div className="text-sm text-gray-900">{n.message || '알림'}</div>
                  <div className="text-xs text-gray-500 mt-1">{formatDateTime(n.createdAt)}</div>
                </div>
                <div className="flex items-center gap-2">
                  {n.url && (
                    <button
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                      onClick={() => navigate(n.url)}
                    >
                      이동
                    </button>
                  )}
                  {!n.isRead && (
                    <button
                      className="text-xs text-slate-600 hover:text-slate-800"
                      onClick={() => markAsRead(n.id)}
                    >
                      읽음
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {/* 페이지네이션 컨트롤 */}
          <div className="mt-3 flex items-center justify-end gap-3">
            <div className="text-xs text-gray-500">
              페이지 {totalPages === 0 ? 0 : page} / {totalPages || 0}
            </div>
            <div className="flex items-center gap-1">
              <button
                className="px-2 py-1 text-xs rounded-lg bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={totalPages === 0 || page <= 1}
              >
                이전
              </button>
              <button
                className="px-2 py-1 text-xs rounded-lg bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={totalPages === 0 || page >= totalPages}
              >
                다음
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Insight;

// 하단 통계 배너 컴포넌트: 4개 유형별 카운트(Acceleration, Drowsiness, Braking, Abnormal)
const TypeSummary = ({ notifications }) => {
  const counts = React.useMemo(() => {
    const c = { Acceleration: 0, Drowsiness: 0, Braking: 0, Abnormal: 0 };
    notifications.forEach((n) => {
      // 서버 표준 모델에 warningType이 있으면 활용, 없으면 type을 매핑(선택적으로)
      const t = n.warningType || n.type;
      if (t && c.hasOwnProperty(t)) c[t] += 1;
    });
    return c;
  }, [notifications]);

  const Box = ({ label, value, className }) => (
    <div className={`flex flex-col items-center rounded-xl p-3 shadow-sm ${className}`}>
      <div className="text-xs font-semibold opacity-80">{label}</div>
      <div className="text-lg font-extrabold">{value}</div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
      <Box label="급가속" value={counts.Acceleration} className="bg-red-50 text-red-700" />
      <Box label="졸음" value={counts.Drowsiness} className="bg-orange-50 text-orange-700" />
      <Box label="급제동" value={counts.Braking} className="bg-rose-50 text-rose-700" />
      <Box label="이상감지" value={counts.Abnormal} className="bg-blue-50 text-blue-700" />
    </div>
  );
};
