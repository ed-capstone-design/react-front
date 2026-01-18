import { useMemo } from "react";
import dayjs from "dayjs";
import { useDispatchList } from "../QueryLayer/useDispatch";
import { useDriverList } from "../QueryLayer/useDriver";
import { useUnreadNotification } from "../QueryLayer/useNotification";
import { StatCard } from "../../components/Dashboard/StartCard";

const AdminDashboard = () => {
  const today = dayjs().format("YYYY-MM-DD");
  const sevenDaysAgo = dayjs().subtract(6, "day").format("YYYY-MM-DD");

  // 1. 배차 데이터 소비: 7일간의 데이터를 가져옴
  const { data: dispatches = [], isLoading: isDispatchLoading } =
    useDispatchList(sevenDaysAgo, today, "ALL");

  // 2. 운전자 데이터 소비
  const { data: drivers = [], isLoading: isDriverLoading } = useDriverList();

  // 3. 알림 데이터 소비
  const { data: unreadData } = useUnreadNotification();

  // 4. 데이터 가공: 기존 600줄 코드에 있던 계산 로직을 useMemo로 압축
  const stats = useMemo(() => {
    const todayData = dispatches.filter((d) => d.dispatchDate === today);
    return {
      totalDrivers: drivers.length,
      todayCount: todayData.length,
      ongoingCount: todayData.filter((d) => d.status === "RUNNING").length,
      unreadCount: unreadData?.unreadCount || 0,
      // 주간 차트 데이터 생성
      weeklyChart: Array.from({ length: 7 }, (_, i) => {
        const date = dayjs()
          .subtract(6 - i, "day")
          .format("YYYY-MM-DD");
        return {
          date,
          count: dispatches.filter((d) => d.dispatchDate === date).length,
        };
      }),
    };
  }, [dispatches, drivers, unreadData, today]);

  if (isDispatchLoading || isDriverLoading) return <div>로딩 중...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">운행 현황 대시보드</h1>
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="오늘 배차" value={stats.todayCount} />
        <StatCard title="운행 중" value={stats.ongoingCount} />
        <StatCard title="전체 운전자" value={stats.totalDrivers} />
        <StatCard title="미확인 알림" value={stats.unreadCount} />
      </div>
    </div>
  );
};

export default AdminDashboard;
