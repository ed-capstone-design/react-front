/**
 * 백엔드 표준 API 응답 처리 유틸리티
 * 표준 응답 구조: { success: boolean, message: string, data: any }
 */

/**
 * API 응답에서 데이터 추출
 * @param {Object} response - axios 응답 객체
 * @param {any} fallback - 실패 시 반환할 기본값
 * @returns {any} - 추출된 데이터 또는 기본값
 */
export const extractResponseData = (response, fallback = null) => {
  try {
    // 표준 응답 구조인 경우
    if (response.data && typeof response.data === 'object') {
      // { success, message, data } 구조
      if ('success' in response.data && 'data' in response.data) {
        return response.data.success ? response.data.data : fallback;
      }
      
      // { data } 구조만 있는 경우
      if ('data' in response.data) {
        return response.data.data;
      }
      
      // 직접 data가 응답인 경우 (레거시 지원)
      return response.data;
    }
    
    return fallback;
  } catch (error) {
    console.error('응답 데이터 추출 실패:', error);
    return fallback;
  }
};

/**
 * API 에러에서 메시지 추출
 * @param {Object} error - axios 에러 객체
 * @param {string} defaultMessage - 기본 에러 메시지
 * @returns {string} - 추출된 에러 메시지
 */
export const extractErrorMessage = (error, defaultMessage = '요청 처리 중 오류가 발생했습니다.') => {
  try {
    // 디버그 모드에서 에러 구조 출력
    if (localStorage.getItem('DEBUG_API_ERROR')) {
      console.log('🔍 API 에러 분석:', {
        hasResponse: !!error.response,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        code: error.code
      });
    }

    // 네트워크 에러
    if (!error.response) {
      return '서버와의 연결에 실패했습니다. 네트워크를 확인해주세요.';
    }

    const { status, data } = error.response;
    
    // 표준 에러 응답 구조에서 메시지 추출
    if (data && typeof data === 'object') {
      // { success: false, message: "에러메시지", data: null } 구조
      if ('success' in data && data.success === false && data.message) {
        return data.message;
      }
      
      // { message: "에러메시지" } 구조
      if (data.message) {
        return data.message;
      }
      
      // { error: "에러메시지" } 구조
      if (data.error) {
        return data.error;
      }
    }
    
    // HTTP 상태 코드별 기본 메시지
    switch (status) {
      case 400:
        return '잘못된 요청입니다. 입력값을 확인해주세요.';
      case 401:
        return '인증이 필요합니다. 다시 로그인해주세요.';
      case 403:
        return '접근 권한이 없습니다.';
      case 404:
        return '요청한 리소스를 찾을 수 없습니다.';
      case 409:
        return '데이터 충돌이 발생했습니다.';
      case 422:
        return '입력 데이터를 처리할 수 없습니다.';
      case 500:
        return '서버 내부 오류가 발생했습니다.';
      default:
        return defaultMessage;
    }
  } catch (e) {
    console.error('에러 메시지 추출 실패:', e);
    return defaultMessage;
  }
};

/**
 * API 호출 결과 표준화
 * @param {Promise} apiCall - API 호출 Promise
 * @param {any} fallbackData - 실패 시 반환할 기본 데이터
 * @returns {Promise<{success: boolean, data: any, message: string}>}
 */
export const standardizeApiCall = async (apiCall, fallbackData = null) => {
  try {
    const response = await apiCall;
    const data = extractResponseData(response, fallbackData);
    
    return {
      success: true,
      data,
      message: response.data?.message || '요청이 성공적으로 처리되었습니다.'
    };
  } catch (error) {
    const message = extractErrorMessage(error);
    
    return {
      success: false,
      data: fallbackData,
      message
    };
  }
};

/**
 * 성공 응답 검증
 * @param {Object} response - API 응답
 * @returns {boolean} - 성공 여부
 */
export const isSuccessResponse = (response) => {
  try {
    return response?.data?.success === true;
  } catch {
    return false;
  }
};

/**
 * 에러 응답 검증
 * @param {Object} response - API 응답
 * @returns {boolean} - 에러 여부
 */
export const isErrorResponse = (response) => {
  try {
    return response?.data?.success === false;
  } catch {
    return false;
  }
};