# 인증 토큰 & WebSocket / API 사용 가이드

본 문서는 프론트엔드(react-front) 현재 구현 상태 기준으로 Access / Refresh 토큰 구조, 자동 재발급 흐름, Axios & STOMP(WebSocket) 사용 패턴, 그리고 개발 시 주의사항을 정리한 것입니다.

---
## 1. 토큰 구조
| 구분 | 필드 | 저장 위치 | 만료 | 용도 |
|------|------|-----------|------|------|
| Access Token | `accessToken` (기존 호환 위해 `token` alias 가능) | memory + localStorage | 짧음(예: 15~30m 가정) | 모든 보호된 REST API 호출 / WebSocket CONNECT 인증 |
| Refresh Token | `refreshToken` | memory + localStorage | 김(예: 7~30d 가정) | Access 재발급 전용, 서버로만 전송 (재발급 endpoint) |

### 호환성
- 서버가 예전 응답 형태로 `token` 하나만 내려줄 경우: 프론트는 이를 `accessToken` 으로 간주 (refresh 없음 → 자동 재발급 불가)
- 새 구조: `{ accessToken, refreshToken }`

### 저장 전략
- TokenProvider 내부 state + localStorage 동기화
- 메모리 우선 사용 (렌더 빠름), 새로고침 대비 localStorage fallback

---
## 2. 로그인 플로우 (Auth.jsx)
1. 사용자가 자격 증명 제출 → 서버 로그인 API 호출
2. 응답 파싱: 
   - `accessToken` 존재 → 저장
   - `refreshToken` 존재 → 저장
   - 둘 다 없고 `token` 하나만 존재 → accessToken 으로 저장 (레거시)
3. Axios 기본 Authorization 헤더 설정 (`Bearer <accessToken>`)
4. 이후 페이지로 라우팅

에러 시:
- 누락된 필드나 예상 구조와 다르면 콘솔 경고 + 사용자 피드백

---
## 3. Axios 인터셉터 & 자동 재발급
### 요청 인터셉터 (setupAxios)
- 항상 최신 accessToken을 Authorization 헤더에 주입 (TokenProvider에서 getToken)

### 응답 인터셉터 로직
1. 응답이 401 이고, 재시도되지 않은(originalRequest._retry !== true)
2. Refresh Token 존재 + (에러 payload가 재발급 대상임을 암시) → refresh 시도
3. 동시 다발 401 방지를 위해 Single-Flight Queue (Promise 공유)
4. 성공 시 업데이트된 accessToken으로 원 요청 재시도
5. Refresh 실패 → 로그아웃 처리 (토큰 삭제, 위치 이동 등 - 구현 상태에 따라 보완 가능)

### TODO 예정 (#36)
- 서버 에러 코드 기반 분기 (예: `ACCESS_EXPIRED`, `REFRESH_EXPIRED`, `INVALID_SIGNATURE` 등) → 현재는 메시지/상태로 휴리스틱

---
## 4. WebSocket(STOMP) 인증 정책
### 현재 설계
- Authorization 헤더는 STOMP CONNECT frame 에서만 전송
- SUBSCRIBE / SEND 시에는 토큰을 헤더에 넣지 않음 (보안/단순화)

### 재연결 시나리오
- 초기 연결: TokenProvider의 현재 accessToken 사용
- AccessToken이 백그라운드에서 갱신된 경우: 현 단계에서는 즉시 WS 강제 재연결 자동화 미구현 (#35 TODO)
  - 영향: 기존 연결은 만료된 토큰으로 유지 → 서버가 별도 검사(예: 메시지별 인증 재검증)를 하지 않는 한 정상 동작, 검사 시 DISCONNECT/ERROR 수신할 수 있음
  - 해결 예정 전략: TokenProvider에서 lastRefreshTimestamp를 expose → WebSocketProvider가 감지 후 debounce 재연결

### Persistent Subscription 관리
- `subscribePersistent(topic, handler, key)` 형태(Provider 내부)로 구독 보존
- 재연결 시 자동 재구독
- 중복 구독 시도 차단 (key map)

### 권한 가드
- ROLE_DRIVER 사용자의 관리/모니터링 전용 topic(location/obd 등) 구독 시도 차단 → 서버 WARN/Disconnect 예방
- 30초 쿨다운 캐시로 반복 토스트/로그 억제

---
## 5. 실시간 데이터 훅 (useLiveDispatch) 개요
1. 초기 REST 호출 → dispatch meta 로드 (서버 응답 envelope에서 data만 언래핑)
2. WebSocket 구독 → 위치 / OBD 메시지 수신
3. Sliding Age 계산 (lastLocationAgeSec, lastObdAgeSec)
4. Stale 판단: 각각 메시지 수신 간격이 예상 주기 * 3 초과 시 `stale.location` 또는 `stale.obd` true
5. kpis 객체로 파생 데이터 제공 (속도, rpm, soc 등)

---
## 6. Notification 흐름
- 로그인 시 과거 알림 fetch
- WebSocket `/user/queue/notifications` 구독 자동 설정
- 수신 payload normalization (타입/시간 변환)
- Toast & 내부 상태 저장 (중복 억제: payload id 기반)

---
## 7. 개발 시 체크리스트
| 항목 | 확인 포인트 | 관련 TODO |
|------|-------------|-----------|
| 토큰 재연결 | Token refresh 후 WS 재연결 동작 여부 | #35 |
| 401 분류 | 에러 코드 표준화 / util 분기 | #36 |
| useLiveDispatch 의존성 | effect dependency 최소화 (불필요 재구독 방지) | #29 |
| Unsubscribe 경고 | 활성 없는 예약 해제시 경고 제거 | #30 |
| 문서화 | 백엔드 topic/스키마 문서 보완 | #21 |

---
## 8. 예시 코드 스니펫
### 8.1 API 호출 (Axios 자동 토큰 주입)
```js
import apiClient from './api/client';

async function fetchDispatch(id) {
  const { data } = await apiClient.get(`/dispatches/${id}`);
  return data;
}
```

### 8.2 강제 토큰 갱신 트리거 (필요 시)
```js
import { useToken } from '../components/Token/TokenProvider';

function ForceRefreshButton() {
  const { refreshAccessToken } = useToken(); // 내부 공개 함수라고 가정 (export 필요 시 추가)
  return <button onClick={refreshAccessToken}>강제 갱신</button>;
}
```

### 8.3 WebSocket 커스텀 구독
```js
import { useWebSocket } from '../components/WebSocket/WebSocketProvider';
import { useEffect } from 'react';

export default function useCustomTopic(topic, handler) {
  const { subscribePersistent, unsubscribe } = useWebSocket();
  useEffect(() => {
    const key = `custom:${topic}`;
    subscribePersistent(topic, handler, key);
    return () => unsubscribe(key);
  }, [topic, handler, subscribePersistent, unsubscribe]);
}
```

---
## 9. 에러/로그 패턴
| 상황 | 콘솔/토스트 | 조치 |
|------|-------------|------|
| 중복 구독 시도 | (Silent 또는 debug 로그) | 무시 (idempotent) |
| 권한 부족 topic 구독 | 1회성 경고 | 구독 안함, 30s 후 재시도 가능 |
| Refresh 실패 | 토스트/로그 + 로그아웃 | 재로그인 유도 |
| Stale 발생 | 배지로 시각 표시 | 네트워크 / 장치 상태 점검 |

---
## 10. 향후 개선 로드맵
| 번호 | 내용 | 개요 |
|------|------|------|
| #35 | 토큰 갱신 시 WS 재연결 | lastRefresh 감지 → debounce reconnect |
| #36 | 401 분류 유틸 | 서버 에러코드 매핑 테이블 & 재발급 조건 명확화 |
| #29 | useLiveDispatch 최적화 | effect 분리 / memo 안정화 |
| #30 | 안전한 unsubscribe | 존재하지 않는 key 처리시 warn 제거 |
| #21 | 실시간 백엔드 스펙 문서 | topic, payload schema, sample 메시지 |

---
## 11. FAQ
**Q. 왜 SUBSCRIBE 때 토큰을 안 붙이나요?**  
A. CONNECT 인증이 완료되면 세션 내 추가 프레임마다 토큰을 반복 전송할 필요가 없고, 헤더 민감도/노출 범위를 축소할 수 있습니다.

**Q. Access 만료 후에도 WS가 계속 살아있는데?**  
A. 현재 서버가 프레임마다 재검증하지 않는 구조라면 기존 세션은 유지됩니다. 재검증 또는 disconnect 정책이 있다면 #35 재연결 구현 후 해결됩니다.

**Q. Refresh 토큰이 만료되면?**  
A. 재발급 실패 → 로그아웃 처리. 401 분류 유틸 도입 시 사용자 안내 문구 구체화 가능.

---
## 12. 용어 정의
| 용어 | 의미 |
|------|------|
| Stale | 기대 주기 대비 수신 지연(3배 초과) 상태 |
| Persistent Subscription | 재연결 시 자동 복구되는 구독 레코드 |
| Single-Flight | 동시에 들어온 동일 작업을 하나의 Promise로 공유하는 패턴 |

---
## 13. 빠른 점검 Checklist
- [ ] 로그인 후 localStorage에 access/refresh 정상 저장
- [ ] 401 강제 발생 시 refresh 1회만 호출되는지
- [ ] refresh 성공 후 원래 요청 재시도 OK
- [ ] WebSocket 재연결 후 기존 topic 자동 재구독 (수동 새로고침 시)
- [ ] ROLE_DRIVER 권한 제한 topic 구독 차단 동작
- [ ] Stale 배지 상황 재현 가능 (의도적 지연)

---
문서 개선이나 추가 항목 요청 시 `#21` 문서화 작업과 함께 반영 예정.
