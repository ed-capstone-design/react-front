# 프로젝트 이슈 및 개선사항 분석

## 🚨 발견된 주요 문제점

### 1. 보안 관련 이슈 ⚠️

#### 1.1 토큰 저장 방식의 취약점

**문제점:**

- Access Token과 Refresh Token을 `localStorage`에 저장
- XSS(Cross-Site Scripting) 공격에 취약
- JavaScript를 통해 토큰에 접근 가능

**영향도:** 🔴 높음

**권장 해결방안:**

```javascript
// 현재 (취약)
localStorage.setItem("accessToken", token);
localStorage.setItem("refreshToken", refreshToken);

// 개선안
// 1. httpOnly 쿠키 사용 (서버 측 Set-Cookie)
// 2. Refresh Token은 쿠키, Access Token은 메모리에만 저장
// 3. SameSite, Secure 속성 설정
```

**관련 파일:**

- [src/components/Token/TokenProvider.jsx](src/components/Token/TokenProvider.jsx)

---

#### 1.2 API 키 노출

**문제점:**

- `.env` 파일이 Git 히스토리에 포함됨
- Kakao Maps API 키가 코드에 하드코딩 가능성

**현재 상태:**

```env
REACT_APP_KAKAO_MAP_API_KEY=f8bf1fa087f8708a45c0c961cfbf693d
```

**영향도:** 🔴 높음

**권장 해결방안:**

1. ✅ `.env` 파일이 `.gitignore`에 추가되어 있음 (양호)
2. ⚠️ 하지만 `.env` 파일이 attachments에 포함되어 있음
3. 🔴 **즉시 API 키 재발급 필요**
4. 환경별 키 분리 (.env.development, .env.production)
5. API 키 도메인 제한 설정

---

#### 1.3 하드코딩된 백엔드 URL

**문제점:**

```javascript
// src/api/setupAxios.js
axios.defaults.baseURL = "http://localhost:8080";
```

**영향도:** 🟡 중간

**권장 해결방안:**

```javascript
axios.defaults.baseURL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
```

---

### 2. 아키텍처 및 설계 이슈 🏗️

#### 2.1 WebSocket 토큰 갱신 문제

**문제점:**

- Access Token 갱신 후 WebSocket 연결이 자동으로 재연결되지 않음
- 갱신된 토큰이 WebSocket에 반영되지 않아 인증 실패 가능

**현재 상태:**

```javascript
// TokenProvider에서 토큰 갱신
refreshAccessToken() → 새 accessToken 저장

// WebSocketProvider는 갱신 사실을 모름
// 기존 연결은 이전 토큰으로 유지
```

**영향도:** 🔴 높음

**권장 해결방안:**

```javascript
// TokenProvider.jsx - 토큰 갱신 이벤트 발행
const [lastRefreshTimestamp, setLastRefreshTimestamp] = useState(0);

const refreshAccessToken = async () => {
  // ... 토큰 갱신 로직
  setLastRefreshTimestamp(Date.now());
};

// WebSocketProvider.jsx - 토큰 갱신 감지
useEffect(() => {
  if (lastRefreshTimestamp > 0) {
    // Debounce 후 재연결
    const timer = setTimeout(() => {
      disconnect();
      connect(); // 새 토큰으로 재연결
    }, 1000);
    return () => clearTimeout(timer);
  }
}, [lastRefreshTimestamp]);
```

**관련 TODO:** #35

---

#### 2.2 에러 코드 표준화 부재

**문제점:**

- 401 에러 처리 시 메시지 텍스트로 휴리스틱 판단
- 에러 타입 구분이 불명확 (ACCESS_EXPIRED vs REFRESH_EXPIRED)

**현재 상태:**

```javascript
// TokenProvider.jsx - 불안정한 에러 판단
const msg = String(error.response?.data?.message || "").toLowerCase();
if (msg.includes("expired") || msg.includes("만료")) {
  // 토큰 갱신 시도
}
```

**영향도:** 🟡 중간

**권장 해결방안:**

```javascript
// 서버 응답 표준화
{
  "success": false,
  "errorCode": "ACCESS_TOKEN_EXPIRED",
  "message": "액세스 토큰이 만료되었습니다"
}

// 클라이언트 에러 핸들러
const ERROR_CODES = {
  ACCESS_TOKEN_EXPIRED: 'ACCESS_TOKEN_EXPIRED',
  REFRESH_TOKEN_EXPIRED: 'REFRESH_TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  // ...
};

if (error.response?.data?.errorCode === ERROR_CODES.ACCESS_TOKEN_EXPIRED) {
  // 토큰 갱신 시도
}
```

**관련 TODO:** #36

---

#### 2.3 의존성 배열 과다

**문제점:**

- `useLiveDispatch` 훅에서 불필요한 의존성으로 인한 재구독 발생

**영향도:** 🟡 중간

**권장 해결방안:**

```javascript
// useCallback, useMemo로 참조 안정화
const handleLocationUpdate = useCallback((message) => {
  // ...
}, []); // 의존성 최소화

useEffect(() => {
  subscribeDispatchLocation(dispatchId, handleLocationUpdate);
}, [dispatchId, handleLocationUpdate]); // 필요한 의존성만
```

**관련 TODO:** #29

---

### 3. 성능 관련 이슈 ⚡

#### 3.1 실시간 데이터 수신 주기

**문제점:**

- 현재 10초 주기로 위치/OBD 데이터 수신
- 실시간성 부족

**현재 상태:**

```javascript
// useLiveDispatch.js
const EXPECTED_INTERVAL_MS = 10000; // 10초
```

**영향도:** 🟡 중간 (기능적으로는 문제없으나 UX 개선 필요)

**권장 해결방안:**

1. 서버 측 전송 주기를 1초로 변경
2. 클라이언트 상수 업데이트

```javascript
const EXPECTED_INTERVAL_MS = 1000; // 1초
```

---

#### 3.2 불필요한 리렌더링

**문제점:**

- Context Provider의 값 변경 시 전체 하위 트리 리렌더링
- 최적화되지 않은 상태 업데이트

**영향도:** 🟢 낮음 (현재 규모에서는 문제없으나 확장 시 고려 필요)

**권장 해결방안:**

```javascript
// Context 분리
// Bad
const value = { data, loading, error, update };

// Good - 자주 변경되는 값과 안정적인 값 분리
const stateValue = useMemo(
  () => ({ data, loading, error }),
  [data, loading, error]
);
const apiValue = useMemo(() => ({ update }), []);

<StateContext.Provider value={stateValue}>
  <ApiContext.Provider value={apiValue}>{children}</ApiContext.Provider>
</StateContext.Provider>;
```

---

#### 3.3 메모리 누수 가능성

**문제점:**

- 버퍼 관리에서 무제한 증가 가능성
- WebSocket 구독 해제 누락 가능성

**현재 상태:**

```javascript
// useLiveDispatch.js
const locationBufferRef = useRef([]);
const obdBufferRef = useRef([]);

// 슬라이딩 윈도우는 구현되어 있으나 극단적 상황 처리 필요
```

**영향도:** 🟡 중간

**권장 해결방안:**

```javascript
// 최대 버퍼 크기 제한
const MAX_BUFFER_SIZE = 1000;

const pushBuffer = (ref, sample, windowMs) => {
  ref.current.push(sample);

  // 시간 기반 정리
  const cutoff = Date.now() - windowMs;
  while (ref.current.length > 0) {
    const first = ref.current[0];
    const t = new Date(first.timestamp).getTime();
    if (t < cutoff) ref.current.shift();
    else break;
  }

  // 크기 기반 제한 (안전장치)
  if (ref.current.length > MAX_BUFFER_SIZE) {
    ref.current = ref.current.slice(-MAX_BUFFER_SIZE);
  }
};
```

---

### 4. 사용자 경험 (UX) 이슈 🎨

#### 4.1 로딩 상태 표시 부족

**문제점:**

- 일부 페이지에서 로딩 인디케이터 누락
- 사용자가 로딩 중인지 알 수 없음

**영향도:** 🟡 중간

**권장 해결방안:**

```javascript
// 공통 로딩 컴포넌트 사용
{
  loading ? (
    <div className="flex justify-center items-center h-64">
      <LoadingSpinner />
    </div>
  ) : (
    <Content />
  );
}
```

---

#### 4.2 에러 메시지 국제화 부재

**문제점:**

- 에러 메시지가 한글/영어 혼재
- 일관성 없는 사용자 피드백

**영향도:** 🟢 낮음

**권장 해결방안:**

```javascript
// i18n 라이브러리 도입
import { useTranslation } from "react-i18next";

const { t } = useTranslation();
toast.error(t("errors.network"));
```

---

#### 4.3 Stale 데이터 경고 표시

**문제점:**

- 30초 이상 데이터 수신 없을 때 경고 표시하지만 사용자 안내 부족

**영향도:** 🟡 중간

**권장 해결방안:**

```javascript
// 시각적 피드백 강화
{
  stale.location && (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
      <div className="flex items-center">
        <IoWarning className="text-yellow-500 mr-2" />
        <p className="text-yellow-700">
          위치 데이터 수신이 지연되고 있습니다. (30초 이상)
          <button onClick={retryConnection}>재연결 시도</button>
        </p>
      </div>
    </div>
  );
}
```

---

### 5. 코드 품질 및 유지보수성 📝

#### 5.1 일관성 없는 파일 확장자

**문제점:**

```
src/App.jsx          ✅ JSX
src/index.js         ⚠️ JS (JSX 포함)
src/hooks/*.js       ✅ JS (React 없음)
src/pages/*.jsx      ✅ JSX
```

**영향도:** 🟢 낮음

**권장 해결방안:**

- JSX를 포함하는 모든 파일은 `.jsx` 확장자 사용
- `index.js` → `index.jsx`로 변경

---

#### 5.2 PropTypes 또는 TypeScript 부재

**문제점:**

- Props 타입 검증 없음
- 런타임 에러 가능성 증가

**현재 상태:**

```javascript
// 타입 검증 없음
const BusCard = ({ bus, onClick }) => {
  // bus.id는 있을까? 없을까?
};
```

**영향도:** 🟡 중간

**권장 해결방안:**

```javascript
// Option 1: PropTypes
import PropTypes from "prop-types";

BusCard.propTypes = {
  bus: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    status: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func,
};

// Option 2: TypeScript 마이그레이션 (장기)
interface Bus {
  id: number;
  name: string;
  status?: string;
}

interface BusCardProps {
  bus: Bus;
  onClick?: () => void;
}

const BusCard: React.FC<BusCardProps> = ({ bus, onClick }) => {
  // ...
};
```

---

#### 5.3 매직 넘버 및 상수 관리

**문제점:**

- 하드코딩된 숫자/문자열 산재
- 변경 시 여러 파일 수정 필요

**현재 상태:**

```javascript
// 여러 파일에 산재
if (ageSec > 30) { ... } // 30초는 무엇?
setTimeout(() => {}, 10000); // 10초는 무엇?
```

**영향도:** 🟡 중간

**권장 해결방안:**

```javascript
// src/constants/config.js
export const WEBSOCKET_CONFIG = {
  RECONNECT_MAX_ATTEMPTS: 10,
  RECONNECT_DELAY_MS: 3000,
  HEARTBEAT_INTERVAL_MS: 30000,
};

export const DATA_CONFIG = {
  LOCATION_UPDATE_INTERVAL_MS: 10000,
  OBD_UPDATE_INTERVAL_MS: 10000,
  STALE_THRESHOLD_MULTIPLIER: 3,
  BUFFER_WINDOW_LOCATION_MS: 5 * 60 * 1000,
  BUFFER_WINDOW_OBD_MS: 60 * 1000,
};

// 사용
import { DATA_CONFIG } from "@/constants/config";
if (
  ageSec >
  (DATA_CONFIG.STALE_THRESHOLD_MULTIPLIER *
    DATA_CONFIG.LOCATION_UPDATE_INTERVAL_MS) /
    1000
) {
  // ...
}
```

---

#### 5.4 주석 및 문서화 부족

**문제점:**

- 복잡한 로직에 설명 주석 부족
- JSDoc 스타일 문서 미사용

**영향도:** 🟡 중간

**권장 해결방안:**

```javascript
/**
 * 실시간 배차 운행 데이터를 구독하고 관리하는 커스텀 훅
 *
 * @param {number} dispatchId - 배차 ID
 * @returns {{
 *   loading: boolean,
 *   error: Error | null,
 *   meta: Object | null,
 *   latestLocation: Object | null,
 *   latestObd: Object | null,
 *   kpis: Object,
 *   stale: { location: boolean, obd: boolean }
 * }}
 *
 * @example
 * const { latestLocation, kpis, stale } = useLiveDispatch(123);
 */
export function useLiveDispatch(dispatchId) {
  // ...
}
```

---

### 6. 테스트 관련 이슈 🧪

#### 6.1 테스트 코드 부재

**문제점:**

- `src/` 디렉토리에 테스트 파일 없음
- 리팩토링 시 회귀 버그 위험

**영향도:** 🔴 높음

**권장 해결방안:**

```javascript
// src/components/Token/__tests__/TokenProvider.test.jsx
import { renderHook, act } from "@testing-library/react";
import { TokenProvider, useToken } from "../TokenProvider";

describe("TokenProvider", () => {
  it("should store and retrieve tokens", () => {
    const wrapper = ({ children }) => <TokenProvider>{children}</TokenProvider>;
    const { result } = renderHook(() => useToken(), { wrapper });

    act(() => {
      result.current.login({
        accessToken: "test-access",
        refreshToken: "test-refresh",
      });
    });

    expect(result.current.getToken()).toBe("test-access");
  });

  it("should refresh token on 401", async () => {
    // ...
  });
});
```

---

#### 6.2 E2E 테스트 부재

**문제점:**

- 전체 사용자 플로우 검증 불가

**영향도:** 🟡 중간

**권장 해결방안:**

- Playwright 또는 Cypress 도입

```javascript
// e2e/login.spec.js
test("should login and navigate to dashboard", async ({ page }) => {
  await page.goto("http://localhost:3000");
  await page.fill('[name="username"]', "admin");
  await page.fill('[name="password"]', "password");
  await page.click('[type="submit"]');
  await expect(page).toHaveURL(/.*dashboard/);
});
```

---

### 7. 배포 및 인프라 이슈 🚀

#### 7.1 환경별 설정 분리 부재

**문제점:**

- `.env` 파일만 존재
- 개발/스테이징/프로덕션 환경 구분 없음

**영향도:** 🟡 중간

**권장 해결방안:**

```bash
# 환경별 파일 생성
.env.development
.env.staging
.env.production

# package.json 스크립트
"scripts": {
  "start": "react-scripts start",
  "build:staging": "env-cmd -f .env.staging react-scripts build",
  "build:production": "env-cmd -f .env.production react-scripts build"
}
```

---

#### 7.2 빌드 최적화 부족

**문제점:**

- Code splitting 설정 없음
- 번들 크기 최적화 미흡

**현재 빌드 결과:**

```
build/static/js/main.0e057a01.js (크기 미확인)
```

**영향도:** 🟢 낮음 (현재 규모에서는 문제없으나 확장 시 고려 필요)

**권장 해결방안:**

```javascript
// React.lazy를 사용한 code splitting
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const RealtimeOperation = React.lazy(() => import("./pages/RealtimeOperation"));

// 라우트에서 사용
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/realtime/:id" element={<RealtimeOperation />} />
  </Routes>
</Suspense>;
```

---

#### 7.3 CI/CD 파이프라인 부재

**문제점:**

- 자동화된 빌드/테스트/배포 프로세스 없음

**영향도:** 🟡 중간

**권장 해결방안:**

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm ci
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          # 배포 스크립트
```

---

### 8. 접근성 (Accessibility) 이슈 ♿

#### 8.1 키보드 네비게이션 미흡

**문제점:**

- 마우스 없이 사용 어려움
- tabindex, ARIA 속성 부족

**영향도:** 🟡 중간

**권장 해결방안:**

```javascript
<button
  onClick={handleClick}
  onKeyDown={(e) => e.key === "Enter" && handleClick()}
  tabIndex={0}
  aria-label="운전자 상세 보기"
>
  상세
</button>
```

---

#### 8.2 시맨틱 HTML 미사용

**문제점:**

- `<div>` 과다 사용
- 적절한 HTML5 태그 미사용

**영향도:** 🟢 낮음

**권장 해결방안:**

```javascript
// Bad
<div className="header">...</div>
<div className="nav">...</div>
<div className="main">...</div>

// Good
<header>...</header>
<nav>...</nav>
<main>...</main>
```

---

## 📊 이슈 우선순위 매트릭스

| 이슈                 | 영향도  | 긴급도 | 해결 난이도 | 우선순위 |
| -------------------- | ------- | ------ | ----------- | -------- |
| 토큰 저장 방식 (XSS) | 🔴 높음 | 높음   | 중간        | 🔥 P0    |
| API 키 노출          | 🔴 높음 | 높음   | 낮음        | 🔥 P0    |
| 테스트 코드 부재     | 🔴 높음 | 중간   | 높음        | 🔥 P0    |
| WebSocket 토큰 갱신  | 🔴 높음 | 높음   | 중간        | 🔥 P0    |
| 에러 코드 표준화     | 🟡 중간 | 중간   | 낮음        | ⚠️ P1    |
| 하드코딩된 URL       | 🟡 중간 | 낮음   | 낮음        | ⚠️ P1    |
| PropTypes/TypeScript | 🟡 중간 | 낮음   | 중간        | ⚠️ P1    |
| 환경별 설정 분리     | 🟡 중간 | 중간   | 낮음        | ⚠️ P1    |
| 실시간 데이터 주기   | 🟡 중간 | 낮음   | 중간        | ℹ️ P2    |
| Code Splitting       | 🟢 낮음 | 낮음   | 낮음        | ℹ️ P2    |
| 국제화 (i18n)        | 🟢 낮음 | 낮음   | 중간        | ℹ️ P3    |

---

## 🎯 개선 로드맵

### Phase 1: 긴급 보안 패치 (1주)

- [ ] Kakao Maps API 키 재발급
- [ ] .env 파일 Git 히스토리에서 제거
- [ ] localStorage → httpOnly 쿠키 마이그레이션 계획

### Phase 2: 안정성 개선 (2-3주)

- [ ] WebSocket 토큰 갱신 로직 구현
- [ ] 에러 코드 표준화
- [ ] 핵심 로직 단위 테스트 작성
- [ ] 환경 변수 설정 개선

### Phase 3: 코드 품질 향상 (2-3주)

- [ ] PropTypes 또는 TypeScript 도입
- [ ] 공통 상수 파일 분리
- [ ] JSDoc 주석 추가
- [ ] ESLint/Prettier 설정 강화

### Phase 4: 성능 및 확장성 (2-3주)

- [ ] Code Splitting 적용
- [ ] 불필요한 리렌더링 최적화
- [ ] 메모리 누수 방지 개선
- [ ] 번들 크기 최적화

### Phase 5: 장기 개선 (1-2개월)

- [ ] TypeScript 완전 마이그레이션
- [ ] E2E 테스트 구축
- [ ] CI/CD 파이프라인 구축
- [ ] 국제화 지원
- [ ] 접근성 개선

---

## 🔧 즉시 적용 가능한 Quick Fixes

### 1. API 키 보안 (5분)

```bash
# 1. Kakao Developers에서 새 API 키 발급
# 2. .env 파일 업데이트
# 3. 기존 키 비활성화
# 4. .env를 .gitignore에 추가 확인 (이미 되어 있음)
```

### 2. 백엔드 URL 환경 변수화 (5분)

```javascript
// src/api/setupAxios.js
axios.defaults.baseURL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";
```

```env
# .env
REACT_APP_API_BASE_URL=http://localhost:8080
```

### 3. 에러 바운더리 추가 (15분)

```javascript
// src/components/ErrorBoundary.jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>문제가 발생했습니다. 페이지를 새로고침해주세요.</div>;
    }
    return this.props.children;
  }
}

// App.jsx
<ErrorBoundary>
  <Router>...</Router>
</ErrorBoundary>;
```

### 4. 상수 파일 분리 (30분)

```javascript
// src/constants/index.js
export const API_ENDPOINTS = {
  AUTH: {
    SIGNIN: "/api/auth/signin",
    SIGNUP: "/api/auth/signup",
    REFRESH: "/api/auth/refresh",
  },
  DRIVERS: {
    LIST: "/api/admin/drivers",
    DETAIL: (id) => `/api/admin/drivers/${id}`,
  },
  // ...
};

export const WEBSOCKET_CONFIG = {
  MAX_RECONNECT_ATTEMPTS: 10,
  RECONNECT_DELAY_MS: 3000,
};

export const DATA_INTERVALS = {
  LOCATION_UPDATE_MS: 10000,
  OBD_UPDATE_MS: 10000,
};
```

---

## 📈 개선 효과 예측

### 보안 개선 후

- ✅ XSS 공격 위험 감소
- ✅ API 키 유출 방지
- ✅ 보안 감사 통과 가능

### 테스트 코드 추가 후

- ✅ 버그 조기 발견
- ✅ 리팩토링 안정성 향상
- ✅ 코드 문서화 효과

### 성능 최적화 후

- ✅ 초기 로딩 시간 30-50% 감소 예상
- ✅ 메모리 사용량 감소
- ✅ 사용자 경험 개선

---

## 📞 문의

이슈 및 개선사항에 대한 질문은 프로젝트 관리자에게 문의하세요.

**마지막 업데이트**: 2026년 1월 8일
