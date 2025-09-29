import axios from 'axios';

// 공용 Axios 인스턴스
// - baseURL만 기본 설정합니다. (권한 토큰은 각 호출부에서 헤더로 전달하는 현재 코드와 호환)
// - 필요 시 추후 인터셉터로 Authorization 주입을 중앙화할 수 있습니다.
const client = axios.create({
  baseURL: 'http://localhost:8080',
});

export default client;
