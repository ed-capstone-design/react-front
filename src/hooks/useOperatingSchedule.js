import { useState, useEffect, useCallback, useRef } from 'react';
import { useScheduleAPI } from './useScheduleAPI';
import { useToast } from '../components/Toast/ToastProvider';
import dayjs from 'dayjs';

export const useOperatingSchedule = () => {
  // Toast 알림 (ref로 안정화)
  const toast = useToast();
  const toastRef = useRef(toast);
  toastRef.current = toast;
  
  // API 훅
  const {
    addSchedule,
    updateSchedule,
    deleteSchedule,
    fetchSchedulesByPeriod
  } = useScheduleAPI();

  // 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  // 기간 및 필터 상태
  const [period, setPeriod] = useState({
    start: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    end: dayjs().add(1, 'day').format('YYYY-MM-DD')
  });
  const [statusFilter, setStatusFilter] = useState(["RUNNING", "SCHEDULED", "DELAYED"]);
  
  // 대기 중인 필터 (조회 버튼 클릭 시 적용)
  const [pendingPeriod, setPendingPeriod] = useState({
    start: period.start,
    end: period.end
  });
  const [pendingStatusFilter, setPendingStatusFilter] = useState([...statusFilter]);

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
    if (!dateTimeString) return '-';
    try {
      // ISO 형식에서 시간 부분만 추출
      const timePart = dateTimeString.split('T')[1];
      if (timePart) {
        return timePart.substring(0, 5); // HH:MM 형식
      }
      return '-';
    } catch (error) {
      return '-';
    }
  }, []);

  // --- 날짜/시간 정규화 유틸 ---
  const pad = (n) => String(n).padStart(2, '0');
  const formatLocalIso = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

  // timeStr: 'HH:mm' 또는 'HH:mm:ss' 또는 ISO -> 반환 'HH:mm'
  const normalizeTimeOnly = (timeStr) => {
    if (!timeStr && timeStr !== 0) return null;
    if (typeof timeStr !== 'string') timeStr = String(timeStr);
    if (timeStr.includes('T')) {
      const part = timeStr.split('T')[1] || '';
      return part.substring(0,5);
    }
    // maybe '14:30:00' or '14:30'
    const m = timeStr.match(/(\d{1,2}:\d{2})/);
    return m ? m[1] : null;
  };

  // Combine dateStr 'YYYY-MM-DD' and time 'HH:mm' into local ISO without timezone: 'YYYY-MM-DDTHH:mm:00'
  const combineDateAndTime = (dateStr, timeStr) => {
    const t = normalizeTimeOnly(timeStr) || '00:00';
    return `${dateStr}T${t}:00`;
  };

  // Ensure scheduled departure/arrival are full local ISO strings and if arrival <= departure, treat arrival as next day
  const normalizeScheduleDateTimes = (payload) => {
    try {
      const out = { ...payload };
      // Find base date: try dispatchDate, date, scheduledDate, or use period.start
      const baseDate = out.dispatchDate || out.date || out.scheduledDate || period.start || ''; 
      // departure
      if (out.scheduledDepartureTime) {
        // if it's a time-only value, combine with baseDate
        if (!out.scheduledDepartureTime.includes('T')) {
          out.scheduledDepartureTime = combineDateAndTime(baseDate, out.scheduledDepartureTime);
        }
      }
      // arrival
      if (out.scheduledArrivalTime) {
        if (!out.scheduledArrivalTime.includes('T')) {
          out.scheduledArrivalTime = combineDateAndTime(baseDate, out.scheduledArrivalTime);
        }
      }

      // If both exist, and arrival <= departure, add 1 day to arrival
      if (out.scheduledDepartureTime && out.scheduledArrivalTime) {
        const dep = new Date(out.scheduledDepartureTime);
        let arr = new Date(out.scheduledArrivalTime);
        if (isNaN(dep.getTime()) || isNaN(arr.getTime())) {
          // invalid dates, return original
          return out;
        }
        if (arr.getTime() <= dep.getTime()) {
          arr = new Date(arr.getTime() + 24 * 3600 * 1000);
          // format back to local ISO (no Z)
          out.scheduledArrivalTime = formatLocalIso(arr);
        }
      }
      return out;
    } catch (e) {
      return payload;
    }
  };

  // 기간 내 스케줄 불러오기
  const loadSchedules = useCallback(async () => {
    try {
      setPeriodLoading(true);
      setFetchError(null);
      
      // statusFilter를 API 파라미터로 전달
      const data = await fetchSchedulesByPeriod(period.start, period.end, statusFilter);
      setPeriodSchedules(data);
    } catch (error) {
      console.error('스케줄 로드 실패:', error);
      setFetchError(error.message || '스케줄을 불러올 수 없습니다.');
      toastRef.current.error('스케줄을 불러올 수 없습니다.');
    } finally {
      setPeriodLoading(false);
    }
  }, [period.start, period.end, statusFilter, fetchSchedulesByPeriod]);

  // 기간/필터 변경 시 자동 로드 (안정된 의존성만 사용)
  useEffect(() => {
    const loadData = async () => {
      try {
        setPeriodLoading(true);
        setFetchError(null);
        
        const data = await fetchSchedulesByPeriod(period.start, period.end, statusFilter);
        setPeriodSchedules(data);
      } catch (error) {
        console.error('스케줄 로드 실패:', error);
        setFetchError(error.message || '스케줄을 불러올 수 없습니다.');
        toastRef.current.error('스케줄을 불러올 수 없습니다.');
      } finally {
        setPeriodLoading(false);
      }
    };
    
    loadData();
  }, [period.start, period.end, statusFilter, fetchSchedulesByPeriod]);

  // 스케줄 추가 핸들러
  const handleAddSchedule = useCallback(async (newSchedule) => {
    try {
      setLoading(true);
      const payload = normalizeScheduleDateTimes(newSchedule);
      await addSchedule(payload);
      toastRef.current.success("스케줄이 성공적으로 추가되었습니다.");
      setModalOpen(false);
      // 추가 후 해당 기간 스케줄 다시 로드
      await loadSchedules();
    } catch (error) {
      console.error('스케줄 추가 실패:', error);
      toastRef.current.error(error.message || "스케줄 추가에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [addSchedule, toast, loadSchedules]);

  // 스케줄 수정 핸들러 (취소 후 재생성 방식)
  const handleUpdateSchedule = useCallback(async (dispatchId, scheduleData) => {
    try {
      setLoading(true);
      console.log('📝 [useOperatingSchedule] 스케줄 수정 시작 - 취소 후 재생성:', { dispatchId, scheduleData });
      
      // 1. 기존 배차 취소
      await deleteSchedule(dispatchId);
      console.log('✅ [useOperatingSchedule] 기존 배차 취소 완료:', dispatchId);
      
      // 2. 새로운 배차 생성
      const payload = normalizeScheduleDateTimes(scheduleData);
      await addSchedule(payload);
      console.log('✅ [useOperatingSchedule] 새로운 배차 생성 완료:', scheduleData);
      
      toastRef.current.success("스케줄이 성공적으로 수정되었습니다.");
      setEditModalOpen(false);
      setEditingSchedule(null);
      
      // 수정 후 해당 기간 스케줄 다시 로드
      await loadSchedules();
      return { success: true };
    } catch (error) {
      console.error('스케줄 수정 실패:', error);
      toastRef.current.error(error.message || "스케줄 수정에 실패했습니다.");
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [deleteSchedule, addSchedule, toast, loadSchedules]);

  // 수정 버튼 클릭 핸들러
  const handleEditClick = useCallback((schedule) => {
    setEditingSchedule(schedule);
    setEditModalOpen(true);
  }, []);

  // 스케줄 삭제 핸들러
  const handleDeleteSchedule = useCallback(async (dispatchId) => {
    if (window.confirm("정말로 이 스케줄을 삭제하시겠습니까?")) {
      try {
        setLoading(true);
        await deleteSchedule(dispatchId);
        toastRef.current.success("스케줄이 성공적으로 삭제되었습니다.");
        // 삭제 후 해당 기간 스케줄 다시 로드
        await loadSchedules();
        return { success: true };
      } catch (error) {
        console.error('스케줄 삭제 실패:', error);
        toastRef.current.error(error.message || "스케줄 삭제에 실패했습니다.");
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    }
    return { success: false };
  }, [deleteSchedule, toast, loadSchedules]);

  // 대기 중 상태 필터 변경
  const handlePendingStatusChange = useCallback((value) => {
    setPendingStatusFilter(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
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
    loadSchedules
  };
};