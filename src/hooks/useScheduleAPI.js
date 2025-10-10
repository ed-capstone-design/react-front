import { useState } from "react";
import axios from "axios";
import { useToken } from '../components/Token/TokenProvider';

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
  const { getToken } = useToken();

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

    // 기간별 배차 조회 (관리자용) - Simple Request로 변경
  const fetchSchedulesByPeriod = async (startDate, endDate, statuses = null) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`📅 [useScheduleAPI] 기간별 배차 조회 (관리자): ${startDate} ~ ${endDate}`, { statuses });
      
      const token = getToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      // Simple Request로 만들기 위해 Content-Type 헤더 제거
      const response = await axios.get('/api/admin/dispatches', {
        params: {
          startDate,
          endDate
        },
        headers: { 
          'Authorization': `Bearer ${token}`
          // Content-Type 헤더 제거하여 preflight 요청 방지
        }
      });
      
      console.log(`📅 [useScheduleAPI] 기간별 배차 응답:`, response.data);
      let data = response.data?.data || response.data;
      
      // 클라이언트에서 상태 필터링 적용
      if (statuses && statuses.length > 0) {
        console.log(`🔍 [useScheduleAPI] 클라이언트 필터링 적용:`, statuses);
        data = data.filter(dispatch => statuses.includes(dispatch.status));
        console.log(`✅ [useScheduleAPI] 필터링 후 배차 수:`, data.length);
      }
      
      return data;
    } catch (error) {
      console.error('❌ [useScheduleAPI] 기간별 배차 조회 실패:', error);
      
      if (error.response?.status === 401) {
        setError('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (error.response?.status === 403) {
        setError('관리자 권한이 필요합니다.');
      } else {
        setError(error.response?.data?.message || '기간별 배차 조회 실패');
      }
      
      return [];
    } finally {
      setLoading(false);
    }
  };

  // 특정 운전자의 배차 조회 (관리자용) - DispatchDetailResponse 기반
  const fetchSchedulesByDriver = async (driverId, options = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`👤 [useScheduleAPI] 운전자 ${driverId} 배차 조회 (관리자):`, options);
      
      const token = getToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      // 기간별 파라미터만 전송 (DispatchDetailResponse 구조에 맞춤)
      const params = {};
      if (options.startDate) params.startDate = options.startDate;
      if (options.endDate) params.endDate = options.endDate;

      const response = await axios.get(`/api/admin/drivers/${driverId}/dispatches`, {
        params,
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log(`✅ [useScheduleAPI] 운전자 ${driverId} 배차 응답:`, response.data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error(`❌ [useScheduleAPI] 운전자 ${driverId} 배차 조회 실패:`, error);
      
      if (error.response?.status === 401) {
        setError('인증이 필요합니다. 다시 로그인해주세요.');
      } else if (error.response?.status === 403) {
        setError('관리자 권한이 필요합니다.');
      } else if (error.response?.status === 404) {
        setError('해당 운전자의 배차 정보를 찾을 수 없습니다.');
      } else {
        setError(error.response?.data?.message || '운전자 배차 조회 실패');
      }
      
      return [];
    } finally {
      setLoading(false);
    }
  };

  // 운전자 정보 조회
  const fetchDriverById = async (driverId) => {
    try {
      console.log(`👤 [useScheduleAPI] 운전자 ${driverId} 정보 조회 시작`);
      
      const token = getToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      const response = await axios.get(`/api/admin/drivers/${driverId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`👤 [useScheduleAPI] 운전자 ${driverId} 정보 응답:`, response.data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error(`❌ [useScheduleAPI] 운전자 ${driverId} 정보 조회 실패:`, error);
      return {
        driverId,
        driverName: `운전자 ${driverId}`,
        phoneNumber: '-',
        status: 'UNKNOWN'
      };
    }
  };

    // 버스 정보 조회
  const fetchBusById = async (busId) => {
    try {
      console.log(`🚌 [useScheduleAPI] 버스 ${busId} 정보 조회 시작`);
      
      const token = getToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      const response = await axios.get(`/api/admin/buses/${busId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`🚌 [useScheduleAPI] 버스 ${busId} 정보 응답:`, response.data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error(`❌ [useScheduleAPI] 버스 ${busId} 정보 조회 실패:`, error);
      return {
        busId,
        busNumber: `${busId}번`,
        route: '-',
        status: 'UNKNOWN'
      };
    }
  };

  // 스케줄 추가 (관리자용)
  const addSchedule = async (scheduleData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`➕ [useScheduleAPI] 배차 생성 (관리자):`, scheduleData);
      console.log(`📋 [useScheduleAPI] 전송할 데이터:`, JSON.stringify(scheduleData, null, 2));
      
      const token = getToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      // AdminDispatchController의 POST /api/admin/dispatches 엔드포인트 사용
      const response = await axios.post('/api/admin/dispatches', scheduleData, {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log(`✅ [useScheduleAPI] 배차 생성 성공:`, response.data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('❌ [useScheduleAPI] 배차 생성 실패:', error);
      handleApiError(error, '스케줄 추가 실패');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 스케줄 수정 (관리자용) - 백엔드에 해당 엔드포인트가 없어 임시 구현
  const updateSchedule = async (dispatchId, scheduleData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`✏️ [useScheduleAPI] 배차 수정 (관리자): ${dispatchId}`, scheduleData);
      
      const token = getToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      // 임시로 기존 엔드포인트 사용 (백엔드에 수정 API 추가 필요)
      const response = await axios.put(`/api/admin/dispatches/${dispatchId}`, scheduleData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ [useScheduleAPI] 배차 수정 성공:`, response.data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('❌ [useScheduleAPI] 배차 수정 실패:', error);
      handleApiError(error, '스케줄 수정 실패');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 스케줄 삭제 - cancel 기능으로 대체 (관리자용)
  const deleteSchedule = async (dispatchId) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🗑️ [useScheduleAPI] 배차 취소 (관리자): ${dispatchId}`);
      
      const token = getToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      // AdminDispatchController의 PATCH /api/admin/dispatches/{dispatchId}/cancel 사용
      const response = await axios.patch(`/api/admin/dispatches/${dispatchId}/cancel`, {}, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ [useScheduleAPI] 배차 취소 성공:`, response.data);
      return { success: true };
    } catch (error) {
      console.error('❌ [useScheduleAPI] 배차 취소 실패:', error);
      handleApiError(error, '스케줄 삭제 실패');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 이용 가능한 운전자 조회 (관리자용)
  const fetchAvailableDrivers = async (startTime, endTime) => {
    try {
      console.log(`👥 [useScheduleAPI] 이용 가능한 운전자 조회 (관리자): ${startTime} ~ ${endTime}`);
      
      const token = getToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      // AdminDispatchController의 GET /api/admin/dispatches/available-drivers 사용
      const response = await axios.get('/api/admin/dispatches/available-drivers', {
        params: { startTime, endTime },
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ [useScheduleAPI] 이용 가능한 운전자 조회 성공:`, response.data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error(`❌ [useScheduleAPI] 이용 가능한 운전자 조회 실패:`, error);
      return [];
    }
  };

  // 이용 가능한 버스 조회 (관리자용)
  const fetchAvailableBuses = async (startTime, endTime) => {
    try {
      console.log(`🚌 [useScheduleAPI] 이용 가능한 버스 조회 (관리자): ${startTime} ~ ${endTime}`);
      
      const token = getToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }

      // AdminDispatchController의 GET /api/admin/dispatches/available-buses 사용
      const response = await axios.get('/api/admin/dispatches/available-buses', {
        params: { startTime, endTime },
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ [useScheduleAPI] 이용 가능한 버스 조회 성공:`, response.data);
      return response.data?.data || response.data;
    } catch (error) {
      console.error(`❌ [useScheduleAPI] 이용 가능한 버스 조회 실패:`, error);
      return [];
    }
  };

  // 운행중인 운전자 조회 (기존 API 활용)
  const fetchRunningDrivers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🚗 [useScheduleAPI] 운행중인 운전자 조회 시작`);
      
      const token = getToken();
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
      }
      
      // 현재 시간 기준으로 당일 배차 조회
      const today = new Date().toISOString().split('T')[0];
      console.log(`📅 [useScheduleAPI] 당일 배차 조회:`, today);
      
      // 당일 모든 배차 조회
      const response = await axios.get('/api/admin/dispatches', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const allDispatches = response.data?.data || response.data || [];
      console.log(`📋 [useScheduleAPI] 전체 배차 수:`, allDispatches.length);
      
      // 운행중 상태의 배차만 필터링 (RUNNING 또는 실제 출발했지만 도착 안한 것들)
      const runningDispatches = allDispatches.filter(dispatch => {
        const isToday = dispatch.scheduledDeparture?.startsWith(today);
        const isRunning = dispatch.status === 'RUNNING' ||
                         (dispatch.actualDeparture && !dispatch.actualArrival);
        
        console.log(`🔍 배차 ${dispatch.dispatchId}: 오늘=${isToday}, 운행중=${isRunning}, 상태=${dispatch.status}`);
        return isToday && isRunning;
      });
      
      console.log(`� [useScheduleAPI] 운행중인 배차 수:`, runningDispatches.length);
      
      // 운전자 정보와 함께 반환
      const driversWithDetails = await Promise.all(
        runningDispatches.map(async (dispatch) => {
          let driverDetail;
          try {
            driverDetail = await fetchDriverById(dispatch.driverId);
          } catch (err) {
            console.error(`운전자 ${dispatch.driverId} 정보 조회 실패:`, err);
            driverDetail = {
              driverId: dispatch.driverId,
              driverName: dispatch.driverName || `운전자 ${dispatch.driverId}`,
              phoneNumber: '-'
            };
          }
          
          return {
            ...driverDetail,
            dispatchId: dispatch.dispatchId,
            busId: dispatch.busId,
            scheduledDeparture: dispatch.scheduledDeparture,
            actualDeparture: dispatch.actualDeparture,
            status: 'RUNNING' // 백엔드 기준에 맞춰 RUNNING 사용
          };
        })
      );
      
      console.log(`✅ [useScheduleAPI] 운행중인 운전자 조회 성공:`, driversWithDetails);
      return driversWithDetails;
    } catch (error) {
      console.error(`❌ [useScheduleAPI] 운행중인 운전자 조회 실패:`, error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
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