import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useToken } from '../components/Token/TokenProvider';

// axios 기본 URL 설정
axios.defaults.baseURL = "http://localhost:8080";

/**
 * 버스 관련 API를 관리하는 커스텀 훅
 * BusContext를 대체하여 페이지별 독립적인 데이터 관리를 제공
 */
export const useBusAPI = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getToken } = useToken();

  // 타임아웃 설정 (5초)
  const TIMEOUT = 5000;

  // 기본 fallback 데이터
  const fallbackBuses = [
    {
      busId: 1,
      routeNumber: "101",
      routeType: "CITY",
      capacity: 45,
      vehicleNumber: "서울70가1234",
      vehicleType: "STANDARD",
      vehicleYear: 2020,
      lastMaintenance: "2024-01-15",
      repairCount: 3,
      operatorId: 1,
      fuelType: "DIESEL"
    }
  ];

  /**
   * 버스 목록 조회
   */
  const fetchBuses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('API 호출 시간 초과')), TIMEOUT)
      );

      const apiPromise = axios.get("/api/buses", {
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      const response = await Promise.race([apiPromise, timeoutPromise]);
      setBuses(response.data);
      return response.data;
    } catch (err) {
      console.log("버스 목록 조회 실패, 예시 데이터 사용");
      setError(err.message);
      setBuses(fallbackBuses);
      return fallbackBuses;
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  /**
   * 특정 버스 상세 정보 조회
   */
  const fetchBusDetail = useCallback(async (busId) => {
    setLoading(true);
    setError(null);

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('API 호출 시간 초과')), TIMEOUT)
      );

      const apiPromise = axios.get(`/api/buses/${busId}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      const response = await Promise.race([apiPromise, timeoutPromise]);
      return response.data;
    } catch (err) {
      console.log(`버스 ${busId} 상세 정보 조회 실패`);
      setError(err.message);
      // fallback 데이터에서 해당 버스 찾기
      return fallbackBuses.find(bus => bus.busId === parseInt(busId)) || fallbackBuses[0];
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  /**
   * 가용한 버스 목록 조회 (스케줄 생성용)
   */
  const fetchAvailableBuses = useCallback(async (date, time) => {
    setLoading(true);
    setError(null);

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('API 호출 시간 초과')), TIMEOUT)
      );

      const apiPromise = axios.get('/api/buses/available', {
        params: { date, time },
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      const response = await Promise.race([apiPromise, timeoutPromise]);
      return response.data;
    } catch (err) {
      console.log("가용 버스 조회 실패, 전체 버스 목록 반환");
      setError(err.message);
      return fallbackBuses;
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  /**
   * 버스 추가
   */
  const addBus = useCallback(async (busData) => {
    setLoading(true);
    setError(null);

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('API 호출 시간 초과')), TIMEOUT)
      );

      const apiPromise = axios.post("/api/buses", busData, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      const response = await Promise.race([apiPromise, timeoutPromise]);
      
      // 로컬 상태 업데이트
      setBuses(prev => [...prev, response.data]);
      return { success: true, data: response.data };
    } catch (err) {
      console.error("버스 추가 실패:", err);
      const errorMessage = err.response?.data?.message || "버스 추가에 실패했습니다.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  /**
   * 버스 정보 수정
   */
  const updateBus = useCallback(async (busId, busData) => {
    setLoading(true);
    setError(null);

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('API 호출 시간 초과')), TIMEOUT)
      );

      const apiPromise = axios.put(`/api/buses/${busId}`, busData, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      const response = await Promise.race([apiPromise, timeoutPromise]);
      
      // 로컬 상태 업데이트
      setBuses(prev => prev.map(bus => 
        bus.busId === busId ? { ...bus, ...response.data } : bus
      ));
      return { success: true, data: response.data };
    } catch (err) {
      console.error("버스 수정 실패:", err);
      const errorMessage = err.response?.data?.message || "버스 수정에 실패했습니다.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  /**
   * 버스 삭제
   */
  const deleteBus = useCallback(async (busId) => {
    setLoading(true);
    setError(null);

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('API 호출 시간 초과')), TIMEOUT)
      );

      const apiPromise = axios.delete(`/api/buses/${busId}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      await Promise.race([apiPromise, timeoutPromise]);
      
      // 로컬 상태 업데이트
      setBuses(prev => prev.filter(bus => bus.busId !== busId));
      return { success: true };
    } catch (err) {
      console.error("버스 삭제 실패:", err);
      const errorMessage = err.response?.data?.message || "버스 삭제에 실패했습니다.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  /**
   * 특정 버스 조회 (로컬 상태에서)
   */
  const getBusById = useCallback((busId) => {
    return buses.find(bus => bus.busId === parseInt(busId));
  }, [buses]);

  /**
   * 버스 통계 계산
   */
  const getBusStats = useCallback(() => {
    return {
      total: buses.length,
      byRouteType: buses.reduce((acc, bus) => {
        acc[bus.routeType] = (acc[bus.routeType] || 0) + 1;
        return acc;
      }, {}),
      byVehicleType: buses.reduce((acc, bus) => {
        acc[bus.vehicleType] = (acc[bus.vehicleType] || 0) + 1;
        return acc;
      }, {}),
      byFuelType: buses.reduce((acc, bus) => {
        acc[bus.fuelType] = (acc[bus.fuelType] || 0) + 1;
        return acc;
      }, {}),
      avgAge: buses.length > 0 ? 
        Math.round(buses.reduce((sum, bus) => sum + (new Date().getFullYear() - bus.vehicleYear), 0) / buses.length) : 0
    };
  }, [buses]);

  /**
   * 버스 필터링 (노선 타입별)
   */
  const getBusesByRouteType = useCallback((routeType) => {
    return buses.filter(bus => bus.routeType === routeType);
  }, [buses]);

  /**
   * 버스 필터링 (차량 타입별)
   */
  const getBusesByVehicleType = useCallback((vehicleType) => {
    return buses.filter(bus => bus.vehicleType === vehicleType);
  }, [buses]);

  /**
   * 정비 필요 버스 조회
   */
  const getMaintenanceRequiredBuses = useCallback(() => {
    const currentDate = new Date();
    const sixMonthsAgo = new Date(currentDate.setMonth(currentDate.getMonth() - 6));
    
    return buses.filter(bus => {
      const lastMaintenanceDate = new Date(bus.lastMaintenance);
      return lastMaintenanceDate < sixMonthsAgo;
    });
  }, [buses]);

  return {
    // 상태
    buses,
    loading,
    error,
    
    // CRUD 함수들
    fetchBuses,
    fetchBusDetail,
    fetchAvailableBuses,
    addBus,
    updateBus,
    deleteBus,
    
    // 유틸리티 함수들
    getBusById,
    getBusStats,
    getBusesByRouteType,
    getBusesByVehicleType,
    getMaintenanceRequiredBuses,
    
    // 상태 조작
    setBuses, // 직접 상태 조작이 필요한 경우
    clearError: () => setError(null)
  };
};

export default useBusAPI;