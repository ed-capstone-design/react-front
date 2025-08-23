import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useDriver } from "../Driver/DriverContext";
import { useBus } from "../Bus/BusContext";

const ScheduleContext = createContext();

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error("useSchedule must be used within a ScheduleProvider");
  }
  return context;
};

export const ScheduleProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 다른 Context에서 데이터 참조
  const { drivers } = useDriver();
  const { buses } = useBus();

  // 초기 데이터 로드 - 날짜별 API 사용으로 불필요
  useEffect(() => {
    // 전체 스케줄 로딩 비활성화
  }, []);

  // 특정 날짜의 스케줄 조회 (API 호출)
  const fetchSchedulesByDate = async (date) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/dispatch/by-date`, {
        params: { date }
      });
      return response.data;
    } catch (error) {
      console.error("날짜별 스케줄 조회 실패:", error);
      setError("해당 날짜의 스케줄을 불러오는데 실패했습니다.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // 운전자별 스케줄 조회 (API 호출 - 날짜 범위 지정)
  const fetchSchedulesByDriver = async (driverId, options = {}) => {
    try {
      setLoading(true);
      const { startDate, endDate, limit = 50 } = options;
      const params = { limit };
      
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await axios.get(`/api/dispatch/driver/${driverId}`, { params });
      return response.data;
    } catch (error) {
      console.error("운전자별 스케줄 조회 실패:", error);
      setError("운전자의 스케줄을 불러오는데 실패했습니다.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // 스케줄 추가
  const addSchedule = async (scheduleData) => {
    try {
      setLoading(true);
      const response = await axios.post("/api/dispatch", scheduleData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("스케줄 추가 실패:", error);
      const errorMessage = error.response?.data?.message || "스케줄 추가에 실패했습니다.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // 스케줄 수정
  const updateSchedule = async (dispatchId, scheduleData) => {
    try {
      setLoading(true);
      const response = await axios.put(`/api/dispatch/${dispatchId}`, scheduleData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("스케줄 수정 실패:", error);
      const errorMessage = error.response?.data?.message || "스케줄 수정에 실패했습니다.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // 스케줄 삭제
  const deleteSchedule = async (dispatchId) => {
    try {
      setLoading(true);
      await axios.delete(`/api/dispatch/${dispatchId}`);
      return { success: true };
    } catch (error) {
      console.error("스케줄 삭제 실패:", error);
      const errorMessage = error.response?.data?.message || "스케줄 삭제에 실패했습니다.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // 운전자 정보 조회 헬퍼
  const getDriverById = (driverId) => {
    return drivers.find(driver => driver.driverId === parseInt(driverId));
  };

  // 버스 정보 조회 헬퍼
  const getBusById = (busId) => {
    return buses.find(bus => bus.busId === parseInt(busId));
  };

  const value = {
    // 상태
    drivers,
    buses,
    loading,
    error,
    
    // 메서드
    fetchSchedulesByDate,
    fetchSchedulesByDriver,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    
    // 헬퍼
    getDriverById,
    getBusById,
    
    // 기타
    clearError: () => setError("")
  };

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
};
