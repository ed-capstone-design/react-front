import React from "react";
import { IoCarSportOutline, IoPeopleOutline, IoStatsChartOutline, IoNotificationsOutline } from "react-icons/io5";
import { useDashboardData7d } from "../hooks/useDashboardData7d";
import WeeklyDispatchBar from "../components/Dashboard/charts/WeeklyDispatchBar";
import HourlyDepartureColumn from "../components/Dashboard/charts/HourlyDepartureColumn";

const DashboardContent = () => {
  const { loading, kpiCounts, todayDispatches, refresh, dispatches7d } = useDashboardData7d();
  // 기존 weeklyCounts, hourlyDistribution 사용 제거 (필요 시 별도 계산 재도입)

  const stats = [
    { icon: <IoCarSportOutline className="text-blue-500 text-3xl" />, label: "오늘 스케줄", value: loading ? "—" : `${kpiCounts.todayTotal}건` },
    { icon: <IoPeopleOutline className="text-green-500 text-3xl" />, label: "운전자 수", value: loading ? "—" : `${kpiCounts.totalDrivers}명` },
    { icon: <IoStatsChartOutline className="text-purple-500 text-3xl" />, label: "운행중 배차", value: loading ? "—" : `${kpiCounts.ongoing}건` },
    { icon: <IoNotificationsOutline className="text-orange-500 text-3xl" />, label: "미읽은 알림", value: loading ? "—" : `${kpiCounts.unreadNotifications}개` },
  ];

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">

      {/* 상단 통계 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((item, idx) => (
          <div
            key={idx}
            className="bg-white ring-1 ring-gray-100 rounded-xl p-6 flex flex-col items-center gap-2 shadow-sm hover:shadow-md transition"
          >
            <div className="mb-2">{item.icon}</div>
            <div className="text-sm font-semibold text-gray-600">{item.label}</div>
            <div className="text-2xl font-extrabold text-gray-900">{item.value}</div>
          </div>
        ))}
      </div>

      {/* 중단: 좌-최근 7일 Bar / 우-최근 7일 시간대별 Column */}
      {/* 차트 섹션 (임시 비활성화: 새 훅 전환 후 weekly/hourly 재계산 미구현) */}
      <div className="mb-12">
        <div className="bg-white rounded-xl shadow p-6 ring-1 ring-gray-100 text-sm text-gray-500">
          차트(주간/시간대)는 훅 분리 후 아직 재계산 로직을 붙이지 않은 상태입니다.
          필요하면 후속 단계에서 weekly/hourly 계산을 useDashboardData7d 내부로 재도입하세요.
          (총 배차: {dispatches7d.length}건)
          <div className="mt-3">
            <button onClick={refresh} disabled={loading} className="px-3 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50">리프레시</button>
          </div>
        </div>
      </div>

      {/* 하단: 금일 배차 간략 리스트 (운행중 하이라이트) */}
      <section className="bg-white rounded-xl shadow p-6 mt-8 ring-1 ring-gray-100">
        <h3 className="text-lg font-bold mb-4 text-gray-900">오늘의 배차 (간략)</h3>
        {loading ? (
          <div className="text-sm text-gray-500">로딩 중…</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {todayDispatches.length === 0 ? (
              <li className="py-3 text-sm text-gray-400">금일 배차 없음</li>
            ) : (
              todayDispatches.map((d) => {
                const now = new Date();
                const dep = new Date(`${d.dispatchDate}T${(d.departureTime?.length===5? d.departureTime+':00': d.departureTime) || '00:00:00'}`);
                const arr = new Date(`${d.dispatchDate}T${(d.arrivalTime?.length===5? d.arrivalTime+':00': d.arrivalTime) || '23:59:59'}`);
                const running = now >= dep && now <= arr;
                return (
                  <li key={d.dispatchId || `${d.dispatchDate}-${d.departureTime}-${d.driverId}`}
                      className={`py-3 px-3 flex justify-between items-center rounded-lg ${running ? 'bg-green-50 ring-1 ring-green-200' : ''}`}>
                    <div className="text-sm font-medium text-gray-900">
                      {d.dispatchDate} {d.departureTime}
                    </div>
                    <div className="text-xs text-gray-500">버스 {d.busId} · 운전자 {d.driverId}</div>
                  </li>
                );
              })
            )}
          </ul>
        )}
      </section>
    </div>
  );
};

const Dashboard = () => <DashboardContent />;

export default Dashboard;