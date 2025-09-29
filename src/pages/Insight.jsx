import React from "react";
import { useNavigate } from "react-router-dom";
import { IoPeopleOutline, IoCalendarOutline, IoCheckmarkCircleOutline, IoTimeOutline } from "react-icons/io5";
import { useWebSocket } from '../components/WebSocket/WebSocketProvider';
import { useNotification } from '../components/Notification/NotificationProvider';
import { useDashboardData } from "../hooks/useDashboardData";
import KakaoMap from "../components/Map/Map";
import DriverListPanel from "../components/Driver/DriverListPanel";

const Insight = () => {
  const navigate = useNavigate();
  const { isConnected } = useWebSocket();
  const { notifications, unreadCount, markAsRead } = useNotification();
  const { loading, kpiCounts, todayDispatches, ongoingCount } = useDashboardData();

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

  // 지도 마커(아직 백엔드 연동 전이라 비워둡니다)
  const markers = React.useMemo(() => [], []);

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
              <h3 className="text-lg font-bold mb-3 text-gray-900">운행중 운전자</h3>
              <div className="bg-white rounded-xl ring-1 ring-gray-100 h-[420px] overflow-hidden">
                <div className="h-full overflow-y-auto px-3 py-2 custom-scrollbar">
                  <DriverListPanel />
                </div>
              </div>
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
