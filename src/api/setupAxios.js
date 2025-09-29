import axios from 'axios';

// 앱 부팅 시 가장 먼저 axios 기본 설정을 주입
axios.defaults.baseURL = 'http://localhost:8080';

try {
  const token = localStorage.getItem('authToken');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
} catch {}

// 명시적으로 아무것도 내보내지 않음 (사이드이펙트만 필요)
export {};
