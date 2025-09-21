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
  const [fetchError, setFetchError] = useState("");
  const [addError, setAddError] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [deleteError, setDeleteError] = useState("");

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
      setFetchError("");
      const response = await axios.get(`/api/dispatch/date`, {
        params: { date}
      });
      return response.data;
    } catch (error) {
      console.error("날짜별 스케줄 조회 실패:", error);
      setFetchError("해당 날짜의 스케줄을 불러오는데 실패했습니다.");
      // 예시 데이터 반환 - 4개 상태별로 구성
      return [
        {
          dispatchId: 1,
          driverId: 1,
          busId: 1,
          dispatchDate: date,
          scheduledDeparture: "08:00",
          actualDeparture: null,
          actualArrival: null,
          status: "SCHEDULED",
          warningCount: 0,
          drivingScore: null
        },
        {
          dispatchId: 2,
          driverId: 2,
          busId: 2,
          dispatchDate: date,
          scheduledDeparture: "09:30",
          actualDeparture: "09:35",
          actualArrival: null,
          status: "RUNNING",
          warningCount: 1,
          drivingScore: null
        },
        {
          dispatchId: 3,
          driverId: 3,
          busId: 3,
          dispatchDate: date,
          scheduledDeparture: "11:00",
          actualDeparture: null,
          actualArrival: null,
          status: "DELAYED",
          warningCount: 0,
          drivingScore: null
        },
        {
          dispatchId: 4,
          driverId: 1,
          busId: 1,
          dispatchDate: date,
          scheduledDeparture: "14:00",
          actualDeparture: "14:02",
          actualArrival: "22:30",
          status: "COMPLETED",
          warningCount: 2,
          drivingScore: 85
        }
      ];
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
      setFetchError("운전자의 스케줄을 불러오는데 실패했습니다.");
      // 예시 데이터 반환
      return [
        {
          dispatchId: 2,
          driverId: parseInt(driverId),
          busId: 1,
          dispatchDate: "2024-08-24",
          scheduledDeparture: "09:00",
          actualDeparture: "09:02",
          actualArrival: "18:15",
          status: "COMPLETED",
          warningCount: 1,
          drivingScore: 88
        }
      ];
    } finally {
      setLoading(false);
    }
  };

  // 기간 단위 스케줄 조회 (API 호출)
  const fetchSchedulesByPeriod = async (startDate, endDate) => {
    try {
      setLoading(true);
      setFetchError("");
      const response = await axios.get(`/api/dispatch/period`, {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error("기간별 스케줄 조회 실패:", error);
      setFetchError("해당 기간의 스케줄을 불러오는데 실패했습니다.");
      // 목업 데이터 반환 - 다양한 상태의 스케줄들
      return [
        {
          dispatchId: 1,
          driverId: 1,
          busId: 1,
          dispatchDate: startDate,
          scheduledDeparture: "08:00",
          actualDeparture: null,
          actualArrival: null,
          status: "SCHEDULED",
          warningCount: 0,
          drivingScore: null
        },
        {
          dispatchId: 2,
          driverId: 2,
          busId: 2,
          dispatchDate: startDate,
          scheduledDeparture: "09:30",
          actualDeparture: "09:35",
          actualArrival: null,
          status: "RUNNING",
          warningCount: 1,
          drivingScore: null
        },
        {
          dispatchId: 3,
          driverId: 3,
          busId: 3,
          dispatchDate: startDate,
          scheduledDeparture: "11:00",
          actualDeparture: null,
          actualArrival: null,
          status: "DELAYED",
          warningCount: 0,
          drivingScore: null
        },
        {
          dispatchId: 4,
          driverId: 1,
          busId: 1,
          dispatchDate: endDate,
          scheduledDeparture: "14:00",
          actualDeparture: "14:02",
          actualArrival: "22:30",
          status: "COMPLETED",
          warningCount: 2,
          drivingScore: 85
        },
        {
          dispatchId: 5,
          driverId: 4,
          busId: 4,
          dispatchDate: endDate,
          scheduledDeparture: "16:00",
          actualDeparture: "16:00",
          actualArrival: null,
          status: "CANCELLED",
          warningCount: 0,
          drivingScore: null
        }
      ];
    } finally {
      setLoading(false);
    }
  };

  // 스케줄 추가
  const addSchedule = async (scheduleData) => {
    try {
      setLoading(true);
      setAddError("");
      const response = await axios.post("/api/dispatch", scheduleData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("스케줄 추가 실패:", error);
      const errorMessage = error.response?.data?.message || "스케줄 추가에 실패했습니다.";
      setAddError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // 스케줄 수정
  const updateSchedule = async (dispatchId, scheduleData) => {
    try {
      setLoading(true);
      setUpdateError("");
      const response = await axios.put(`/api/dispatch/${dispatchId}`, scheduleData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("스케줄 수정 실패:", error);
      const errorMessage = error.response?.data?.message || "스케줄 수정에 실패했습니다.";
      setUpdateError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // 스케줄 삭제
  const deleteSchedule = async (dispatchId) => {
    try {
      setLoading(true);
      setDeleteError("");
      await axios.delete(`/api/dispatch/${dispatchId}`);
      return { success: true };
    } catch (error) {
      console.error("스케줄 삭제 실패:", error);
      const errorMessage = error.response?.data?.message || "스케줄 삭제에 실패했습니다.";
      setDeleteError(errorMessage);
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
    fetchError,
    addError,
    updateError,
    deleteError,
    
    // 메서드
    fetchSchedulesByDate,
    fetchSchedulesByDriver,
    fetchSchedulesByPeriod,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    
    // 헬퍼
    getDriverById,
    getBusById,
    
    // 기타
    clearFetchError: () => setFetchError("") ,
    clearAddError: () => setAddError("") ,
    clearUpdateError: () => setUpdateError("") ,
    clearDeleteError: () => setDeleteError("")
  };

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
};
