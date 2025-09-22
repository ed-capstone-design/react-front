import axios from 'axios';

// 백엔드 서버 연결 상태 확인
export const checkBackendConnection = async () => {
  try {
    // 간단한 health check 엔드포인트 호출
    const response = await axios.get('/api/health', { 
      timeout: 3000,
      headers: {} // 인증 없이 호출
    });
    return {
      connected: true,
      status: response.status,
      message: '백엔드 서버 연결됨'
    };
  } catch (error) {
    console.warn('백엔드 서버 연결 실패:', error.message);
    
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      return {
        connected: false,
        error: 'CORS_OR_NETWORK',
        message: 'CORS 설정 또는 네트워크 연결 문제입니다. 백엔드 서버를 확인해주세요.'
      };
    }
    
    if (error.code === 'ECONNABORTED') {
      return {
        connected: false,
        error: 'TIMEOUT',
        message: '서버 응답 시간이 초과되었습니다.'
      };
    }
    
    return {
      connected: false,
      error: 'UNKNOWN',
      message: `백엔드 서버 오류: ${error.message}`
    };
  }
};

// axios 에러 타입 분석
export const analyzeAxiosError = (error) => {
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return {
      type: 'NETWORK_ERROR',
      message: '네트워크 연결 오류 또는 CORS 설정 문제',
      suggestion: '1. 백엔드 서버가 실행 중인지 확인\n2. CORS 설정 확인\n3. 네트워크 연결 상태 확인'
    };
  }
  
  if (error.response?.status === 401) {
    return {
      type: 'UNAUTHORIZED',
      message: '인증이 필요하거나 토큰이 만료됨',
      suggestion: '로그인을 다시 시도해주세요.'
    };
  }
  
  if (error.response?.status === 403) {
    return {
      type: 'FORBIDDEN',
      message: '접근 권한이 없습니다',
      suggestion: '관리자에게 문의하세요.'
    };
  }
  
  if (error.response?.status >= 500) {
    return {
      type: 'SERVER_ERROR',
      message: '서버 내부 오류',
      suggestion: '잠시 후 다시 시도하거나 관리자에게 문의하세요.'
    };
  }
  
  return {
    type: 'UNKNOWN',
    message: error.message || '알 수 없는 오류',
    suggestion: '페이지를 새로고침하거나 잠시 후 다시 시도해주세요.'
  };
};