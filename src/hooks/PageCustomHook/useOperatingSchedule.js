import { useState, useEffect, useCallback, useRef } from "react";
import {
  useGetDispatches,
  useCreateDispatch,
  useCancelDispatch,
} from "../QueryLayer/useDispatch";
import { dispatchService } from "../../api/ServiceLayer/dispatchService";
import { useToast } from "../../components/Toast/ToastProvider";
import dayjs from "dayjs";

export const useOperatingSchedule = () => {
  // Toast 알림 (ref로 안정화)
  const toast = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;

  // API 훅
  const createDispatchMutation = useCreateDispatch();
  const cancelDispatchMutation = useCancelDispatch();

  // 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  // 기간 및 필터 상태
  const [period, setPeriod] = useState({
    start: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
    end: dayjs().add(1, "day").format("YYYY-MM-DD"),
  });
  const [statusFilter, setStatusFilter] = useState([
    "RUNNING",
    "SCHEDULED",
    "DELAYED",
  ]);

  // 대기 중인 필터 (조회 버튼 클릭 시 적용)
  const [pendingPeriod, setPendingPeriod] = useState({
    start: period.start,
    end: period.end,
  });
  const [pendingStatusFilter, setPendingStatusFilter] = useState([
    ...statusFilter,
  ]);

  // 데이터 상태
  const [periodSchedules, setPeriodSchedules] = useState([]);
  const [periodLoading, setPeriodLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // 상태 옵션
  const statusOptions = [
    { value: "SCHEDULED", label: "예정" },
    { value: "DELAYED", label: "지연" },
    { value: "RUNNING", label: "운행중" },
    { value: "COMPLETED", label: "완료" },
    { value: "CANCELED", label: "취소" },
  ];

  // 시간 추출 유틸리티 함수
  const extractTime = useCallback((dateTimeString) => {
    if (!dateTimeString) return "-";
    try {
      // ISO 형식에서 시간 부분만 추출
      const timePart = dateTimeString.split("T")[1];
      if (timePart) {
        return timePart.substring(0, 5); // HH:MM 형식
      }
      return "-";
    } catch (error) {
      return "-";
    }
  }, []);

  // 기간 내 스케줄 불러오기
  const loadSchedules = useCallback(async () => {
    try {
      setPeriodLoading(true);
      setFetchError(null);

      // statusFilter를 API 파라미터로 전달
      const data = await dispatchService.getDispatches(
        period.start,
        period.end,
        statusFilter.length > 0 ? statusFilter.join(",") : undefined,
      );
      setPeriodSchedules(data);
    } catch (error) {
      console.error("스케줄 로드 실패:", error);
      setFetchError(error.message || "스케줄을 불러올 수 없습니다.");
      toastRef.current.error("스케줄을 불러올 수 없습니다.");
    } finally {
      setPeriodLoading(false);
    }
  }, [period.start, period.end, statusFilter]);

  // 기간/필터 변경 시 자동 로드 (안정된 의존성만 사용)
  useEffect(() => {
    const loadData = async () => {
      try {
        setPeriodLoading(true);
        setFetchError(null);

        const data = await dispatchService.getDispatches(
          period.start,
          period.end,
          statusFilter.length > 0 ? statusFilter.join(",") : undefined,
        );
        setPeriodSchedules(data);
      } catch (error) {
        console.error("스케줄 로드 실패:", error);
        setFetchError(error.message || "스케줄을 불러올 수 없습니다.");
        toastRef.current.error("스케줄을 불러올 수 없습니다.");
      } finally {
        setPeriodLoading(false);
      }
    };

    loadData();
  }, [period.start, period.end, statusFilter]);

  // 스케줄 추가 핸들러
  const handleAddSchedule = useCallback(
    async (newSchedule) => {
      try {
        setLoading(true);
        await createDispatchMutation.mutateAsync(newSchedule);
        toastRef.current.success("스케줄이 성공적으로 추가되었습니다.");
        setModalOpen(false);
        // 추가 후 해당 기간 스케줄 다시 로드
        await loadSchedules();
      } catch (error) {
        console.error("스케줄 추가 실패:", error);
        toastRef.current.error(error.message || "스케줄 추가에 실패했습니다.");
      } finally {
        setLoading(false);
      }
    },
    [createDispatchMutation, loadSchedules],
  );

  // 스케줄 수정 핸들러 (취소 후 재생성 방식)
  const handleUpdateSchedule = useCallback(
    async (dispatchId, scheduleData) => {
      try {
        setLoading(true);
        console.log(
          "📝 [useOperatingSchedule] 스케줄 수정 시작 - 취소 후 재생성:",
          { dispatchId, scheduleData },
        );

        // 1. 기존 배차 취소
        await cancelDispatchMutation.mutateAsync(dispatchId);
        console.log(
          "✅ [useOperatingSchedule] 기존 배차 취소 완료:",
          dispatchId,
        );

        // 2. 새로운 배차 생성
        await createDispatchMutation.mutateAsync(scheduleData);
        console.log(
          "✅ [useOperatingSchedule] 새로운 배차 생성 완료:",
          scheduleData,
        );

        toastRef.current.success("스케줄이 성공적으로 수정되었습니다.");
        setEditModalOpen(false);
        setEditingSchedule(null);

        // 수정 후 해당 기간 스케줄 다시 로드
        await loadSchedules();
        return { success: true };
      } catch (error) {
        console.error("스케줄 수정 실패:", error);
        toastRef.current.error(error.message || "스케줄 수정에 실패했습니다.");
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    },
    [cancelDispatchMutation, createDispatchMutation, loadSchedules],
  );

  // 수정 버튼 클릭 핸들러
  const handleEditClick = useCallback((schedule) => {
    setEditingSchedule(schedule);
    setEditModalOpen(true);
  }, []);

  // 스케줄 삭제 핸들러
  const handleDeleteSchedule = useCallback(
    async (dispatchId) => {
      if (window.confirm("정말로 이 스케줄을 삭제하시겠습니까?")) {
        try {
          setLoading(true);
          await cancelDispatchMutation.mutateAsync(dispatchId);
          toastRef.current.success("스케줄이 성공적으로 삭제되었습니다.");
          // 삭제 후 해당 기간 스케줄 다시 로드
          await loadSchedules();
          return { success: true };
        } catch (error) {
          console.error("스케줄 삭제 실패:", error);
          toastRef.current.error(
            error.message || "스케줄 삭제에 실패했습니다.",
          );
          return { success: false, error: error.message };
        } finally {
          setLoading(false);
        }
      }
      return { success: false };
    },
    [cancelDispatchMutation, loadSchedules],
  );

  // 대기 중 상태 필터 변경
  const handlePendingStatusChange = useCallback((value) => {
    setPendingStatusFilter((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  }, []);

  // 조회 버튼 클릭 시 실제 필터 적용
  const handleSearch = useCallback(() => {
    setPeriod({ ...pendingPeriod });
    setStatusFilter([...pendingStatusFilter]);
  }, [pendingPeriod, pendingStatusFilter]);

  return {
    // 상태
    modalOpen,
    setModalOpen,
    editModalOpen,
    setEditModalOpen,
    editingSchedule,
    setEditingSchedule,
    period,
    statusFilter,
    pendingPeriod,
    setPendingPeriod,
    pendingStatusFilter,
    periodSchedules,
    periodLoading,
    loading,
    fetchError,
    statusOptions,

    // 함수
    extractTime,
    handleAddSchedule,
    handleUpdateSchedule,
    handleEditClick,
    handleDeleteSchedule,
    handlePendingStatusChange,
    handleSearch,
    loadSchedules,
  };
};
