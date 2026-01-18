import { useMemo } from "react";
import dayjs from "dayjs";
import { useDispatchList } from "../../hooks/QueryLayer/useDispatch";
import { useDriverList } from "../../hooks/QueryLayer/useDriver";
import { useUnreadNotification } from "../../hooks/QueryLayer/useNotification";

export const useDashboardData = () => {
  const today = dayjs().format("YYYY-MM-DD");
  const sevenDaysAgo = dayjs().subtract(6, "day").format("YYYY-MM-DD");

  // 1. 배차 데이터 소비: 7일간의 데이터를 가져옴
  const { data: dispatches = [], isLoading: isDispatchLoading } =
    useDispatchList(sevenDaysAgo, today);

  // 2. 운전자 데이터 소비
  const { data: drivers = [], isLoading: isDriverLoading } = useDriverList();

  // 3. 알림 데이터 소비
  const { data: unreadData } = useUnreadNotification();

  // 4. 데이터 가공: 기존 600줄 코드에 있던 계산 로직을 useMemo로 압축
  const stats = useMemo(() => {
    const todayData = dispatches.filter((d) => d.dispatchDate === today);

    // 주간 차트 데이터 생성 (7일)
    const weeklyChart = Array.from({ length: 7 }, (_, i) => {
      const date = dayjs()
        .subtract(6 - i, "day")
        .format("YYYY-MM-DD");
      return {
        date,
        count: dispatches.filter((d) => d.dispatchDate === date).length,
      };
    });

    return {
      totalDrivers: drivers.length,
      todayCount: todayData.length,
      todayScheduled: todayData.filter((d) => d.status === "SCHEDULED").length,
      todayRunning: todayData.filter((d) => d.status === "RUNNING").length,
      todayCompleted: todayData.filter((d) => d.status === "COMPLETED").length,
      unreadCount: unreadData?.unreadCount || 0,
      weeklyChart,
    };
  }, [dispatches, drivers, unreadData, today]);

  // weeklyCounts: 주간 배차 횟수 배열
  const weeklyCounts = useMemo(() => {
    return stats.weeklyChart.map((item) => item.count);
  }, [stats.weeklyChart]);

  // 날짜 범위 정보
  const range = useMemo(() => {
    return {
      startStr: sevenDaysAgo,
      endStr: today,
    };
  }, [sevenDaysAgo, today]);

  return {
    loading: isDispatchLoading || isDriverLoading,
    dispatches7d: dispatches,
    weeklyCounts,
    todayScheduled: stats.todayScheduled,
    todayRunning: stats.todayRunning,
    todayCompleted: stats.todayCompleted,
    range,
    todayStr: today,
  };
};
