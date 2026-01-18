import { useMemo } from "react";
import dayjs from 'dayjs';
import { IoCarSportOutline, IoStatsChartOutline, IoCheckmarkDoneOutline, IoClose } from "react-icons/io5";
import { useDashboardData } from "../hooks/useDashboardData";
import WeeklyDispatchBar from "../components/Dashboard/charts/WeeklyDispatchBar";
import HourlyDepartureColumn from "../components/Dashboard/charts/HourlyDepartureColumn";
import { useNotificationContext } from "../Context/NotificationProvider";
import { useNavigate } from "react-router-dom";

const DashboardContent = () => {
  // todayStr and range are provided by useDashboardData to ensure consistent date handling

  const { notifications = [], loading: notificationsLoading = false } = useNotificationContext();
  const navigate = useNavigate();

  const { loading: dashLoading, weeklyCounts, dispatches7d, todayScheduled, todayRunning, todayCompleted, range, todayStr } = useDashboardData();

  const weekRange = useMemo(() => {
    if (!range) return { startStr: null, endStr: null, sunday: null, saturday: null };
    const sunday = dayjs(range.startStr).startOf('day').toDate();
    const saturday = dayjs(range.endStr).endOf('day').toDate();
    return { startStr: range.startStr, endStr: range.endStr, sunday, saturday };
  }, [range]);

  const weekDispatches = useMemo(() => {
    if (!Array.isArray(dispatches7d)) return [];
    if (!weekRange.startStr || !weekRange.endStr) return [];
    return dispatches7d.filter((d) => {
      const dateKey = d._localDate || d.dispatchDate || d.date || null;
      if (!dateKey) return false;
      return dateKey >= weekRange.startStr && dateKey <= weekRange.endStr;
    });
  }, [dispatches7d, weekRange]);

  const normalizeStatusLocal = (s) => {
    if (s == null) return "SCHEDULED";
    const raw = String(s).trim().toUpperCase();
    const map = {
      SCHEDULED: "SCHEDULED",
      PLANNED: "SCHEDULED",
      RUNNING: "RUNNING",
      IN_PROGRESS: "RUNNING",
      COMPLETED: "COMPLETED",
      FINISHED: "COMPLETED",
      CANCELED: "CANCELED",
      CANCELLED: "CANCELED",
    };
    return map[raw] || "SCHEDULED";
  };

  const weekStats = useMemo(() => {
    const total = weekDispatches.length;
    let completed = 0,
      canceled = 0;
    weekDispatches.forEach((d) => {
      const st = normalizeStatusLocal(d.status ?? d.dispatchStatus ?? d.state ?? d.statusCode);
      if (st === "COMPLETED") completed++;
      if (st === "CANCELED") canceled++;
    });
    return { total, completed, canceled };
  }, [weekDispatches]);

  const weeklyChartData = useMemo(() => {
    const arr = [];
    if (!weekRange.startStr) return arr;
    const start = dayjs(weekRange.startStr);
    for (let i = 0; i < 7; i++) {
      const d = start.add(i, 'day');
      const key = d.format('YYYY-MM-DD');
      const count = (weekDispatches.filter((x) => (x._localDate || x.dispatchDate || x.date) === key) || []).length;
      arr.push({ date: key, count });
    }
    return arr;
  }, [weekRange, weekDispatches]);

  const hourlyDistributionLocal = useMemo(() => {
    const buckets = Array.from({ length: 24 }, (_, h) => ({ hour: h, count: 0 }));
    const parseToMs = (val) => {
      if (val == null) return null;
      if (typeof val === "number") return val < 1e12 ? val * 1000 : val;
      const s = String(val).trim();
      if (/^\d+$/.test(s)) {
        const n = Number(s);
        return n < 1e12 ? n * 1000 : n;
      }
      const p = Date.parse(s);
      return Number.isNaN(p) ? null : p;
    };
    weekDispatches.forEach((d) => {
      const candidate = d.scheduledDepartureTime ?? d.scheduledDeparture ?? d.departureTime ?? d.scheduledDeparture;
      const ms = parseToMs(candidate);
      if (!ms) return;
      const h = new Date(ms).getHours();
      if (!Number.isNaN(h) && h >= 0 && h < 24) buckets[h].count += 1;
    });
    return buckets;
  }, [weekDispatches]);

  const { todayCounts, todayTotal } = useMemo(() => {
    const counts = { SCHEDULED: 0, RUNNING: 0, COMPLETED: 0, CANCELED: 0 };
    if (Array.isArray(dispatches7d)) {
      dispatches7d.forEach(d => {
        const dateKey = d._localDate || d.dispatchDate || d.date || null;
        if (!dateKey) return;
        if (dateKey !== todayStr) return; // 오늘 것만 카운트

        const raw = String(d.status ?? d.dispatchStatus ?? d.state ?? d.statusCode ?? '').trim().toUpperCase();
        let key = 'SCHEDULED';
        if (raw.includes('RUN')) key = 'RUNNING';
        else if (raw.includes('COMP')) key = 'COMPLETED';
        else if (raw.includes('CANCEL')) key = 'CANCELED';

        counts[key] = (counts[key] || 0) + 1;
      });
    }
    const total = counts.SCHEDULED + counts.RUNNING + counts.COMPLETED + counts.CANCELED;
    return { todayCounts: counts, todayTotal: total };
  }, [dispatches7d, todayStr]);

  return (
    <div className="p-6 bg-white">
      <section aria-label="상단 헤더" className="mb-8">
        <header className="flex items-center justify-between flex-wrap">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">대시보드</h2>
        </header>
      </section>

      {/* KPI 카드 */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        {[
          { title: "금일 총 배차", value: todayTotal, icon: <IoStatsChartOutline className="text-3xl text-blue-500" /> },
          { title: "예정", value: todayCounts?.SCHEDULED ?? 0, icon: <IoCarSportOutline className="text-3xl text-green-500" /> },
          { title: "운행중", value: todayCounts?.RUNNING ?? 0, icon: <IoCarSportOutline className="text-3xl text-blue-500" /> },
          { title: "완료", value: todayCounts?.COMPLETED ?? 0, icon: <IoCheckmarkDoneOutline className="text-3xl text-orange-500" /> },
          { title: "취소", value: todayCounts?.CANCELED ?? 0, icon: <IoClose className="text-3xl text-red-500" /> },
        ].map((card, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <p className="mt-1 text-2xl sm:text-3xl font-bold text-gray-900">{dashLoading ? "—" : card.value ?? "—"}</p>
              </div>
              {card.icon}
            </div>
          </div>
        ))}
      </section>

      {/* 메인 레이아웃 */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 차트 영역 */}
        <main className="lg:col-span-2 space-y-6">
          {/* 주간 배차 통계 카드 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-lg font-semibold flex items-center gap-2">
                  주간 배차 통계
                </h4>
                <div className="text-sm text-gray-500">기간: {weekRange.startStr} — {weekRange.endStr}</div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <div className="text-right">
                  <div className="text-sm text-gray-500">총 배차</div>
                  <div className="text-3xl font-extrabold text-gray-900">{weekStats.total}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <div className="text-sm text-gray-600">완료 <span className="font-semibold text-green-600">{weekStats.completed}</span></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <div className="text-sm text-gray-600">취소 <span className="font-semibold text-red-600">{weekStats.canceled}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 주간 차트 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="bg-white rounded-2xl border border-gray-200 p-4 shadow-md hover:shadow-lg transition-shadow duration-200">
              <h5 className="text-sm font-semibold mb-3">주간 배차 추이</h5>
              <WeeklyDispatchBar data={weeklyChartData} />
            </section>

            <section className="bg-white rounded-2xl border border-gray-200 p-4 shadow-md hover:shadow-lg transition-shadow duration-200">
              <h5 className="text-sm font-semibold mb-3">시간대별 출발 분포 (주간 기준)</h5>
              <HourlyDepartureColumn data={hourlyDistributionLocal} />
            </section>
          </div>
        </main>

        {/* 오른쪽: 알림 패널 */}
        <aside
          className="bg-white rounded-2xl border border-gray-200 p-4 shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
          onClick={() => { try { navigate('/insight'); } catch { } }}
          role="button"
          tabIndex={0}
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold">안읽은 알림</h4>
            <span className="text-xs text-gray-500">{notifications?.length ?? 0}개</span>
          </div>

          {notificationsLoading ? (
            <div className="text-gray-500">로딩 중…</div>
          ) : !notifications || notifications.length === 0 ? (
            <div className="text-gray-500 text-sm">미읽음 알림이 없습니다.</div>
          ) : (
            <ul className="space-y-2">
              {notifications.slice(0, 5).map(n => (
                <li key={n.id} className="p-2 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                  <div className="text-sm text-gray-800 truncate">{n.message || '알림'}</div>
                  <div className="text-xs text-gray-400 mt-1">{(n.createdAt && dayjs(n.createdAt).format('YYYY-MM-DD HH:mm')) || ''}</div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </section>
    </div>
  );
};

const Dashboard = () => <DashboardContent />;

export default Dashboard;
