import { useMemo } from "react";
import dayjs from "dayjs";
import { useQueries } from "@tanstack/react-query";
import { useDispatchList, DISPATCH_KEYS } from "./QueryLayer/useDispatch";
import { dispatchService } from "../api/ServiceLayer/dispatchService";

export const useInsightData = () => {
  // 1. 날짜 범위 설정 (어제 ~ 내일)
  const range = useMemo(
    () => ({
      start: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
      end: dayjs().add(1, "day").format("YYYY-MM-DD"),
      today: dayjs().format("YYYY-MM-DD"),
    }),
    []
  );

  // 2. 메인 배차 리스트 조회 (React Query)
  const {
    data: dispatches = [],
    isLoading: isMainLoading,
    isError,
    refetch: refresh,
  } = useDispatchList(range.start, range.end, "ALL");

  // 3. 비즈니스 로직 가공 (600줄의 복잡한 로직을 useMemo로 압축)
  const { todayDispatches, runningList, kpis } = useMemo(() => {
    // 오늘 날짜 데이터 필터링
    const todayData = dispatches.filter(
      (d) =>
        (d.dispatchDate || d.scheduledDepartureTime?.slice(0, 10)) ===
        range.today
    );

    // 운행 중 배차 리스트 (실시간 관제 대상)
    const running = dispatches.filter((d) => d.status === "RUNNING");

    // KPI 수치 계산
    const kpis = {
      todayTotal: todayData.filter((d) => d.status !== "CANCELED").length,
      todayCompleted: todayData.filter((d) => d.status === "COMPLETED").length,
      todayDelayed: todayData.filter((d) => d.status === "DELAYED").length,
      todayRemaining: todayData.filter((d) =>
        ["SCHEDULED", "RUNNING", "DELAYED"].includes(d.status)
      ).length,
    };

    return { todayDispatches: todayData, runningList: running, kpis };
  }, [dispatches, range.today]);

  // 4. 운행 중인 모든 배차의 Driving Record 병렬 조회
  // 기존 loadRunningEventsStats를 useQueries로 대체하여 선언적 관리
  const recordQueries = useQueries({
    queries: runningList.map((r) => ({
      queryKey: DISPATCH_KEYS.record(r.dispatchId),
      queryFn: () => dispatchService.getDispatchRecord(r.dispatchId),
      enabled: !!r.dispatchId,
      staleTime: 1000 * 30, // 30초 캐시
    })),
  });

  // 5. 집계된 통계 가공
  const runningEventsStats = useMemo(() => {
    const stats = {
      DROWSINESS: 0,
      ACCELERATION: 0,
      BRAKING: 0,
      ABNORMAL: 0,
      scoreSum: 0,
      count: 0,
    };
    recordQueries.forEach((q) => {
      if (q.data) {
        stats.DROWSINESS += q.data.drowsinessCount || 0;
        stats.ACCELERATION += q.data.accelerationCount || 0;
        stats.BRAKING += q.data.brakingCount || 0;
        if (q.data.drivingScore) {
          stats.scoreSum += q.data.drivingScore;
          stats.count++;
        }
      }
    });
    return {
      ...stats,
      drivingScoreAverage:
        stats.count > 0 ? (stats.scoreSum / stats.count).toFixed(1) : "-",
      isLoading: recordQueries.some((q) => q.isLoading),
    };
  }, [recordQueries]);

  return {
    loading: isMainLoading,
    error: isError,
    refresh,
    kpis,
    runningList,
    runningEventsStats,
    todayStr: range.today,
  };
};
