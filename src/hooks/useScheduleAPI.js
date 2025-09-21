import { useState } from "react";
import axios from "axios";

// axios 기본 URL 설정
axios.defaults.baseURL = "http://localhost:8080";
axios.defaults.timeout = 5000; // 5초 타임아웃 설정

/**
 * 스케줄 관련 API 호출을 위한 커스텀 훅
 * ScheduleContext를 대체하여 독립적인 API 관리
 * 웹소켓 미준비 상황에서 fallback 데이터 제공
 */
export const useScheduleAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 에러 처리 및 fallback 데이터 반환 헬퍼 함수
  const handleApiError = (err, fallbackMessage, fallbackData = []) => {
    console.error(fallbackMessage, err);
    setError(fallbackMessage);
    
    // 서버 연결 실패시 fallback 데이터 반환
    if (err.code === 'ECONNABORTED' || err.code === 'ECONNREFUSED' || err.message?.includes('timeout')) {
      console.warn('서버 연결 실패 - fallback 데이터 반환:', fallbackData);
      return fallbackData;
    }
    return fallbackData;
  };

  // 특정 날짜의 스케줄 조회
  const fetchSchedulesByDate = async (date) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/dispatch/date`, {
        params: { date }
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, '날짜별 스케줄 조회 실패', []);
    } finally {
      setLoading(false);
    }
  };

  // 특정 운전자의 스케줄 조회
  const fetchSchedulesByDriver = async (driverId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/dispatch/driver/${driverId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, '운전자별 스케줄 조회 실패', []);
    } finally {
      setLoading(false);
    }
  };

  // 기간별 스케줄 조회
  const fetchSchedulesByPeriod = async (startDate, endDate) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/dispatch/period`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, '기간별 스케줄 조회 실패', []);
    } finally {
      setLoading(false);
    }
  };

  // 운전자 정보 조회
  const fetchDriverById = async (driverId) => {
    try {
      const response = await axios.get(`/api/drivers/${driverId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, '운전자 정보 조회 실패', {
        driverId,
        driverName: `운전자 ${driverId}`,
        phoneNumber: '-',
        status: 'UNKNOWN'
      });
    }
  };

  // 버스 정보 조회
  const fetchBusById = async (busId) => {
    try {
      const response = await axios.get(`/api/buses/${busId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error, '버스 정보 조회 실패', {
        busId,
        vehicleNumber: `버스 ${busId}`,
        routeNumber: '-',
        capacity: 0
      });
    }
  };

  // 스케줄 추가
  const addSchedule = async (scheduleData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post('/api/dispatch', scheduleData);
      return response.data;
    } catch (error) {
      handleApiError(error, '스케줄 추가 실패');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 스케줄 수정
  const updateSchedule = async (dispatchId, scheduleData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.put(`/api/dispatch/${dispatchId}`, scheduleData);
      return response.data;
    } catch (error) {
      handleApiError(error, '스케줄 수정 실패');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 스케줄 삭제
  const deleteSchedule = async (dispatchId) => {
    try {
      setLoading(true);
      setError(null);
      await axios.delete(`/api/dispatch/${dispatchId}`);
      return { success: true };
    } catch (error) {
      handleApiError(error, '스케줄 삭제 실패');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 이용 가능한 운전자 조회
  const fetchAvailableDrivers = async (date, time) => {
    try {
      const response = await axios.get('/api/drivers/available', {
        params: { date, time }
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, '이용 가능한 운전자 조회 실패', []);
    }
  };

  // 이용 가능한 버스 조회
  const fetchAvailableBuses = async (date, time) => {
    try {
      const response = await axios.get('/api/buses/available', {
        params: { date, time }
      });
      return response.data;
    } catch (error) {
      return handleApiError(error, '이용 가능한 버스 조회 실패', []);
    }
  };

  // 운행중인 운전자 조회 (배차 테이블 기반)
  const fetchRunningDrivers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 현재 시간에 운행중인 배차를 조회
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toLocaleTimeString('en-GB', { hour12: false });
      
      const response = await axios.get('/api/dispatch/running', {
        params: { date: today, time: now }
      });
      
      // 배차 데이터에서 운전자 정보를 추출하여 운전자 세부 정보와 함께 반환
      const runningSchedules = response.data;
      const driversWithDetails = await Promise.all(
        runningSchedules.map(async (schedule) => {
          const driverDetail = await fetchDriverById(schedule.driverId);
          return {
            ...driverDetail,
            dispatchId: schedule.dispatchId,
            busId: schedule.busId,
            scheduledDeparture: schedule.scheduledDeparture,
            actualDeparture: schedule.actualDeparture,
            status: 'DRIVING' // 운행중 상태로 설정
          };
        })
      );
      
      return driversWithDetails;
    } catch (error) {
      return handleApiError(error, '운행중인 운전자 조회 실패', []);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    fetchSchedulesByDate,
    fetchSchedulesByDriver,
    fetchSchedulesByPeriod,
    fetchDriverById,
    fetchBusById,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    fetchAvailableDrivers,
    fetchAvailableBuses,
    fetchRunningDrivers
  };
};