import React from "react";
import { IoCarSportOutline, IoPeopleOutline, IoStatsChartOutline, IoNotificationsOutline } from "react-icons/io5";
import { useDashboardData } from "../hooks/useDashboardData";
import WeeklyDispatchBar from "../components/Dashboard/charts/WeeklyDispatchBar";
import HourlyDepartureColumn from "../components/Dashboard/charts/HourlyDepartureColumn";

const DashboardContent = () => {
  const { loading, kpiCounts, weeklyCounts, hourlyDistribution, todayDispatches, refresh } = useDashboardData();

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <section className="bg-white rounded-xl shadow p-6 ring-1 ring-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">최근 7일 일별 배차 수</h3>
            <button
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition"
              onClick={refresh}
              disabled={loading}
              title="리프레시"
              aria-label="리프레시"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 6v3l4-4-4-4v3C7.58 4 4 7.58 4 12c0 1.85.63 3.55 1.69 4.9l1.46-1.46A6.01 6.01 0 0 1 6 12c0-3.31 2.69-6 6-6zm6.31 1.1-1.46 1.46A6.01 6.01 0 0 1 18 12c0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.85-.63-3.55-1.69-4.9z"/>
              </svg>
            </button>
          </div>
          <WeeklyDispatchBar data={weeklyCounts} />
        </section>
        <section className="bg-white rounded-xl shadow p-6 ring-1 ring-gray-100">
          <h3 className="text-lg font-bold mb-4 text-gray-900">시간대별 출발 분포 (최근 7일)</h3>
          <HourlyDepartureColumn data={hourlyDistribution} />
        </section>
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