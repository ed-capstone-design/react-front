import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useToken } from '../components/Token/TokenProvider';
import { extractResponseData, extractErrorMessage } from '../utils/responseUtils';

// axios 기본 URL 설정
axios.defaults.baseURL = "http://localhost:8080";

/**
 * 버스 관련 API를 관리하는 커스텀 훅
 * BusContext를 대체하여 페이지별 독립적인 데이터 관리를 제공
 * 백엔드 BusController의 /api/admin/buses 엔드포인트와 연동
 */
export const useBusAPI = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getToken } = useToken();

  // 타임아웃 설정 (5초)
  const TIMEOUT = 5000;

  /**
   * 버스 목록 조회
   */
  const fetchBuses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🚌 [useBusAPI] 버스 목록 조회 시작');
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('API 호출 시간 초과')), TIMEOUT)
      );

      const token = getToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      const apiPromise = axios.get("/api/admin/buses", {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await Promise.race([apiPromise, timeoutPromise]);
      console.log('🚌 [useBusAPI] 서버 응답:', response.data);
      
      // 백엔드 ApiResponse 구조에 맞춰 데이터 추출
      const busData = response.data?.data || [];
      setBuses(busData);
      console.log('🚌 [useBusAPI] 버스 목록 설정 완료:', busData);
      return busData;
    } catch (err) {
      console.error('❌ [useBusAPI] 버스 목록 조회 실패:', err);
      if (err.response?.status === 401) {
        setError('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (err.response?.status === 403) {
        setError('관리자 권한이 필요합니다.');
      } else {
        setError(err.response?.data?.message || err.message || '버스 목록 조회에 실패했습니다.');
      }
      setBuses([]);
      return [];
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
      console.log(`🚌 [useBusAPI] 버스 ${busId} 상세 정보 조회 시작`);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('API 호출 시간 초과')), TIMEOUT)
      );

      const token = getToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      const apiPromise = axios.get(`/api/admin/buses/${busId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await Promise.race([apiPromise, timeoutPromise]);
      console.log(`🚌 [useBusAPI] 버스 ${busId} 상세 정보 응답:`, response.data);
      
      // 백엔드 ApiResponse 구조에 맞춰 데이터 추출
      return response.data?.data || null;
    } catch (err) {
      console.error(`❌ [useBusAPI] 버스 ${busId} 상세 정보 조회 실패:`, err);
      if (err.response?.status === 401) {
        setError('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (err.response?.status === 403) {
        setError('관리자 권한이 필요합니다.');
      } else if (err.response?.status === 404) {
        setError('해당 버스를 찾을 수 없습니다.');
      } else {
        setError(err.response?.data?.message || err.message || '버스 상세 정보 조회에 실패했습니다.');
      }
      return null;
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
      console.log('🚌 [useBusAPI] 가용 버스 목록 조회 시작:', { date, time });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('API 호출 시간 초과')), TIMEOUT)
      );

      const token = getToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      const apiPromise = axios.get('/api/admin/buses/available', {
        params: { date, time },
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await Promise.race([apiPromise, timeoutPromise]);
      console.log('🚌 [useBusAPI] 가용 버스 목록 응답:', response.data);
      
      // 백엔드 ApiResponse 구조에 맞춰 데이터 추출
      return response.data?.data || [];
    } catch (err) {
      console.error('❌ [useBusAPI] 가용 버스 조회 실패:', err);
      if (err.response?.status === 401) {
        setError('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (err.response?.status === 403) {
        setError('관리자 권한이 필요합니다.');
      } else {
        setError(err.response?.data?.message || err.message || '가용 버스 조회에 실패했습니다.');
      }
      return [];
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
      console.log('🚌 [useBusAPI] 버스 추가 시작:', busData);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('API 호출 시간 초과')), TIMEOUT)
      );

      const token = getToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      const apiPromise = axios.post("/api/admin/buses", busData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await Promise.race([apiPromise, timeoutPromise]);
      console.log('🚌 [useBusAPI] 버스 추가 응답:', response.data);
      
      // 백엔드 ApiResponse 구조에 맞춰 데이터 추출
      const newBusData = extractResponseData(response, null);
      if (newBusData) {
        // 로컬 상태 업데이트
        setBuses(prev => [...prev, newBusData]);
      }
      return { success: true, data: newBusData };
    } catch (err) {
      console.error("❌ [useBusAPI] 버스 추가 실패:", err);
      const errorMessage = extractErrorMessage(err, '버스 추가에 실패했습니다.');
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
      console.log(`🚌 [useBusAPI] 버스 ${busId} 수정 시작:`, busData);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('API 호출 시간 초과')), TIMEOUT)
      );

      const token = getToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      const apiPromise = axios.patch(`/api/admin/buses/${busId}`, busData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await Promise.race([apiPromise, timeoutPromise]);
      console.log(`🚌 [useBusAPI] 버스 ${busId} 수정 응답:`, response.data);
      
      // 백엔드 ApiResponse 구조에 맞춰 데이터 추출
      const updatedBusData = extractResponseData(response, null);
      if (updatedBusData) {
        // 로컬 상태 업데이트
        setBuses(prev => prev.map(bus => 
          bus.busId === parseInt(busId) ? { ...bus, ...updatedBusData } : bus
        ));
      }
      return { success: true, data: updatedBusData };
    } catch (err) {
      console.error(`❌ [useBusAPI] 버스 ${busId} 수정 실패:`, err);
      const errorMessage = extractErrorMessage(err, '버스 수정에 실패했습니다.');
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
      console.log(`🚌 [useBusAPI] 버스 ${busId} 삭제 시작`);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('API 호출 시간 초과')), TIMEOUT)
      );

      const token = getToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      const apiPromise = axios.delete(`/api/admin/buses/${busId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await Promise.race([apiPromise, timeoutPromise]);
      console.log(`🚌 [useBusAPI] 버스 ${busId} 삭제 응답:`, response.data);
      
      // 로컬 상태 업데이트
      setBuses(prev => prev.filter(bus => bus.busId !== parseInt(busId)));
      return { success: true };
    } catch (err) {
      console.error(`❌ [useBusAPI] 버스 ${busId} 삭제 실패:`, err);
      const errorMessage = extractErrorMessage(err, '버스 삭제에 실패했습니다.');
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