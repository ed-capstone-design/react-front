import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useToken } from '../components/Token/TokenProvider';

// axios 기본 URL 설정
axios.defaults.baseURL = "http://localhost:8080";

/**
 * 운전자 관련 API를 관리하는 커스텀 훅
 * DriverContext를 대체하여 페이지별 독립적인 데이터 관리를 제공
 */
export const useDriverAPI = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getToken } = useToken();

  // 타임아웃 설정 (5초)
  const TIMEOUT = 5000;

  // 기본 fallback 데이터
  const fallbackDrivers = [
    {
      userId: 1,
      username: "홍길동",
      email: "honggildong@example.com",
      phoneNumber: "010-1234-5678",
      licenseNumber: "12가3456",
      operatorName: "운수사A",
      grade: "A",
      careerYears: 5,
      avgDrivingScore: 4.5,
    }
  ];

  /**
   * 운전자 목록 조회
   */
  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('API 호출 시간 초과')), TIMEOUT)
      );

      const apiPromise = axios.get("/api/drivers/me", {
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      const response = await Promise.race([apiPromise, timeoutPromise]);
      setDrivers(response.data);
      return response.data;
    } catch (err) {
      console.log("운전자 목록 조회 실패, 예시 데이터 사용");
      setError(err.message);
      setDrivers(fallbackDrivers);
      return fallbackDrivers;
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  /**
   * 특정 운전자 상세 정보 조회
   */
  const fetchDriverDetail = useCallback(async (driverId) => {
    setLoading(true);
    setError(null);

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('API 호출 시간 초과')), TIMEOUT)
      );

      const apiPromise = axios.get(`/api/drivers/${driverId}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      const response = await Promise.race([apiPromise, timeoutPromise]);
      return response.data;
    } catch (err) {
      console.log(`운전자 ${driverId} 상세 정보 조회 실패`);
      setError(err.message);
      // fallback 데이터에서 해당 운전자 찾기
      return fallbackDrivers.find(driver => driver.userId === parseInt(driverId)) || fallbackDrivers[0];
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  /**
   * 가용한 운전자 목록 조회 (스케줄 생성용)
   */
  const fetchAvailableDrivers = useCallback(async (date, time) => {
    setLoading(true);
    setError(null);

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('API 호출 시간 초과')), TIMEOUT)
      );

      const apiPromise = axios.get('/api/drivers/available', {
        params: { date, time },
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      const response = await Promise.race([apiPromise, timeoutPromise]);
      return response.data;
    } catch (err) {
      console.log("가용 운전자 조회 실패, 전체 운전자 목록 반환");
      setError(err.message);
      return fallbackDrivers;
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  /**
   * 운전자 정보 수정
   */
  const updateDriver = useCallback(async (driver) => {
    setLoading(true);
    setError(null);

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('API 호출 시간 초과')), TIMEOUT)
      );

      const apiPromise = axios.put(`/api/drivers/me/${driver.userId}`, driver, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      await Promise.race([apiPromise, timeoutPromise]);
      
      // 로컬 상태 업데이트
      setDrivers(prev => prev.map(d => d.userId === driver.userId ? driver : d));
      return { success: true };
    } catch (err) {
      console.error("운전자 수정 실패:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  /**
   * 운전자 삭제
   */
  const deleteDriver = useCallback(async (userId) => {
    setLoading(true);
    setError(null);

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('API 호출 시간 초과')), TIMEOUT)
      );

      const apiPromise = axios.delete(`/api/drivers/${userId}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      await Promise.race([apiPromise, timeoutPromise]);
      
      // 로컬 상태 업데이트
      setDrivers(prev => prev.filter(d => d.userId !== userId));
      return { success: true };
    } catch (err) {
      console.error("운전자 삭제 실패:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  /**
   * 운전자 추가 (필요시)
   */
  const addDriver = useCallback(async (driverData) => {
    setLoading(true);
    setError(null);

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('API 호출 시간 초과')), TIMEOUT)
      );

      const apiPromise = axios.post('/api/drivers', driverData, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      const response = await Promise.race([apiPromise, timeoutPromise]);
      
      // 로컬 상태 업데이트
      setDrivers(prev => [...prev, response.data]);
      return { success: true, data: response.data };
    } catch (err) {
      console.error("운전자 추가 실패:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  /**
   * 운전자 스케줄 이력 조회
   */
  const fetchDriverScheduleHistory = useCallback(async (driverId, params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('API 호출 시간 초과')), TIMEOUT)
      );

      const apiPromise = axios.get(`/api/drivers/${driverId}/schedules`, {
        params,
        headers: { Authorization: `Bearer ${getToken()}` }
      });

      const response = await Promise.race([apiPromise, timeoutPromise]);
      return response.data;
    } catch (err) {
      console.log(`운전자 ${driverId} 스케줄 이력 조회 실패`);
      setError(err.message);
      return []; // 빈 배열 반환
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  return {
    // 상태
    drivers,
    loading,
    error,
    
    // 함수들
    fetchDrivers,
    fetchDriverDetail,
    fetchAvailableDrivers,
    updateDriver,
    deleteDriver,
    addDriver,
    fetchDriverScheduleHistory,
    
    // 유틸리티
    setDrivers, // 직접 상태 조작이 필요한 경우
    clearError: () => setError(null)
  };
};

export default useDriverAPI;