import { useState, useCallback } from 'react';
import axios from 'axios';
import { useToken } from '../components/Token/TokenProvider';

// axios 기본 URL 설정
axios.defaults.baseURL = "http://localhost:8080";

/**
 * 운전자 배차 관련 API를 관리하는 커스텀 훅
 * 백엔드 DriverDispatchController의 /api/driver/me/dispatches 엔드포인트와 연동
 * DRIVER 권한이 필요한 API들을 처리
 */
export const useDriverDispatchAPI = () => {
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getToken } = useToken();

  // 타임아웃 설정 (5초)
  const TIMEOUT = 5000;

  /**
   * 지정된 날짜 범위 사이의 자신의 배차 조회
   * GET /api/driver/me/dispatches?startDate={startDate}&endDate={endDate}
   */
  const fetchMyDispatchesByDateRange = useCallback(async (startDate, endDate) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🚗 [useDriverDispatchAPI] 배차 목록 조회 시작:', { startDate, endDate });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('API 호출 시간 초과')), TIMEOUT)
      );

      const token = getToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      const apiPromise = axios.get("/api/driver/me/dispatches", {
        params: { startDate, endDate },
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await Promise.race([apiPromise, timeoutPromise]);
      console.log('🚗 [useDriverDispatchAPI] 배차 목록 응답:', response.data);
      
      // 백엔드 ApiResponse 구조에 맞춰 데이터 추출
      const dispatchData = response.data?.data || [];
      setDispatches(dispatchData);
      console.log('🚗 [useDriverDispatchAPI] 배차 목록 설정 완료:', dispatchData);
      return dispatchData;
    } catch (err) {
      console.error('❌ [useDriverDispatchAPI] 배차 목록 조회 실패:', err);
      if (err.response?.status === 401) {
        setError('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (err.response?.status === 403) {
        setError('운전자 권한이 필요합니다.');
      } else {
        setError(err.response?.data?.message || err.message || '배차 목록 조회에 실패했습니다.');
      }
      setDispatches([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  /**
   * 자신에게 할당된 특정 배차 상세 조회
   * GET /api/driver/me/dispatches/{dispatchId}
   */
  const fetchMyDispatchById = useCallback(async (dispatchId) => {
    setLoading(true);
    setError(null);

    try {
      console.log(`🚗 [useDriverDispatchAPI] 배차 ${dispatchId} 상세 조회 시작`);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('API 호출 시간 초과')), TIMEOUT)
      );

      const token = getToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      const apiPromise = axios.get(`/api/driver/me/dispatches/${dispatchId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await Promise.race([apiPromise, timeoutPromise]);
      console.log(`🚗 [useDriverDispatchAPI] 배차 ${dispatchId} 상세 응답:`, response.data);
      
      // 백엔드 ApiResponse 구조에 맞춰 데이터 추출
      return response.data?.data || null;
    } catch (err) {
      console.error(`❌ [useDriverDispatchAPI] 배차 ${dispatchId} 상세 조회 실패:`, err);
      if (err.response?.status === 401) {
        setError('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (err.response?.status === 403) {
        setError('운전자 권한이 필요합니다.');
      } else if (err.response?.status === 404) {
        setError('해당 배차를 찾을 수 없습니다.');
      } else {
        setError(err.response?.data?.message || err.message || '배차 상세 정보 조회에 실패했습니다.');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  /**
   * 자신의 배차 운행 시작
   * PATCH /api/driver/me/dispatches/{dispatchId}/start
   */
  const startMyDispatch = useCallback(async (dispatchId) => {
    setLoading(true);
    setError(null);

    try {
      console.log(`🚗 [useDriverDispatchAPI] 배차 ${dispatchId} 운행 시작`);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('API 호출 시간 초과')), TIMEOUT)
      );

      const token = getToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      const apiPromise = axios.patch(`/api/driver/me/dispatches/${dispatchId}/start`, {}, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await Promise.race([apiPromise, timeoutPromise]);
      console.log(`🚗 [useDriverDispatchAPI] 배차 ${dispatchId} 운행 시작 응답:`, response.data);
      
      // 백엔드 ApiResponse 구조에 맞춰 데이터 추출
      const updatedDispatch = response.data?.data;
      if (updatedDispatch) {
        // 로컬 상태 업데이트
        setDispatches(prev => prev.map(dispatch => 
          dispatch.dispatchId === parseInt(dispatchId) ? { ...dispatch, ...updatedDispatch } : dispatch
        ));
      }
      return { success: true, data: updatedDispatch };
    } catch (err) {
      console.error(`❌ [useDriverDispatchAPI] 배차 ${dispatchId} 운행 시작 실패:`, err);
      let errorMessage = '배차 운행 시작에 실패했습니다.';
      
      if (err.response?.status === 401) {
        errorMessage = '인증이 필요합니다. 다시 로그인해주세요.';
      } else if (err.response?.status === 403) {
        errorMessage = '운전자 권한이 필요합니다.';
      } else if (err.response?.status === 404) {
        errorMessage = '해당 배차를 찾을 수 없습니다.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  /**
   * 자신의 배차 운행 종료
   * PATCH /api/driver/me/dispatches/{dispatchId}/end
   */
  const endMyDispatch = useCallback(async (dispatchId) => {
    setLoading(true);
    setError(null);

    try {
      console.log(`🚗 [useDriverDispatchAPI] 배차 ${dispatchId} 운행 종료`);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('API 호출 시간 초과')), TIMEOUT)
      );

      const token = getToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      const apiPromise = axios.patch(`/api/driver/me/dispatches/${dispatchId}/end`, {}, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const response = await Promise.race([apiPromise, timeoutPromise]);
      console.log(`🚗 [useDriverDispatchAPI] 배차 ${dispatchId} 운행 종료 응답:`, response.data);
      
      // 백엔드 ApiResponse 구조에 맞춰 데이터 추출
      const updatedDispatch = response.data?.data;
      if (updatedDispatch) {
        // 로컬 상태 업데이트
        setDispatches(prev => prev.map(dispatch => 
          dispatch.dispatchId === parseInt(dispatchId) ? { ...dispatch, ...updatedDispatch } : dispatch
        ));
      }
      return { success: true, data: updatedDispatch };
    } catch (err) {
      console.error(`❌ [useDriverDispatchAPI] 배차 ${dispatchId} 운행 종료 실패:`, err);
      let errorMessage = '배차 운행 종료에 실패했습니다.';
      
      if (err.response?.status === 401) {
        errorMessage = '인증이 필요합니다. 다시 로그인해주세요.';
      } else if (err.response?.status === 403) {
        errorMessage = '운전자 권한이 필요합니다.';
      } else if (err.response?.status === 404) {
        errorMessage = '해당 배차를 찾을 수 없습니다.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  /**
   * 특정 배차 조회 (로컬 상태에서)
   */
  const getDispatchById = useCallback((dispatchId) => {
    return dispatches.find(dispatch => dispatch.dispatchId === parseInt(dispatchId));
  }, [dispatches]);

  /**
   * 오늘의 배차 목록 조회 (편의 메소드)
   */
  const fetchTodaysDispatches = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    return fetchMyDispatchesByDateRange(today, today);
  }, [fetchMyDispatchesByDateRange]);

  /**
   * 이번 주 배차 목록 조회 (편의 메소드)
   */
  const fetchThisWeeksDispatches = useCallback(async () => {
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    
    const startDate = weekStart.toISOString().split('T')[0];
    const endDate = weekEnd.toISOString().split('T')[0];
    
    return fetchMyDispatchesByDateRange(startDate, endDate);
  }, [fetchMyDispatchesByDateRange]);

  /**
   * 운행 상태별 배차 필터링
   */
  const getDispatchesByStatus = useCallback((status) => {
    return dispatches.filter(dispatch => dispatch.status === status);
  }, [dispatches]);

  return {
    // 상태
    dispatches,
    loading,
    error,
    
    // CRUD 함수들
    fetchMyDispatchesByDateRange,
    fetchMyDispatchById,
    startMyDispatch,
    endMyDispatch,
    
    // 편의 함수들
    fetchTodaysDispatches,
    fetchThisWeeksDispatches,
    getDispatchById,
    getDispatchesByStatus,
    
    // 상태 조작
    setDispatches, // 직접 상태 조작이 필요한 경우
    clearError: () => setError(null)
  };
};

export default useDriverDispatchAPI;