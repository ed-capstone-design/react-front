# 프로젝트 명세서: 운전의 진수 (Driver Management System)

## 📋 프로젝트 개요

### 프로젝트 명

**운전의 진수 - 버스/운전자/배차 관리 시스템**

### 프로젝트 설명

현대적인 SaaS 스타일의 버스 운행 관리 웹 애플리케이션입니다. 관리자가 운전자, 차량, 배차 일정을 실시간으로 모니터링하고 관리할 수 있는 종합 관리 시스템입니다.

### 개발 기간

2025년 5월 ~ 2025년 6월 (활동 히스토리 기준)

### 프로젝트 타입

React 기반 Single Page Application (SPA)

---

## 🎯 주요 기능

### 1. 인증 및 사용자 관리

- **JWT 기반 인증 시스템**
  - Access Token / Refresh Token 분리 관리
  - 자동 토큰 갱신 (Axios 인터셉터)
  - 토큰 만료 시 자동 로그아웃 및 리다이렉션
  - 역할 기반 접근 제어 (ROLE_ADMIN, ROLE_DRIVER)

### 2. 대시보드 (Dashboard)

- **오늘의 운행 현황**
  - 예정/운행중/완료 상태별 배차 목록
  - 실시간 상태 업데이트
- **통계 차트**
  - 주간 배차 현황 (막대 그래프)
  - 시간대별 출발 분포 (컬럼 차트)
- **알림 요약**
  - 최근 알림 미리보기
  - 미읽음 알림 카운트

### 3. 운전자 관리 (Drivers)

- 운전자 목록 조회 (카드/리스트 뷰)
- 운전자 상세 정보 모달
- 운전자 정보 수정
- 실시간 상태 표시 (대기중/운행중/휴식중)
- 운전자 추가/삭제 기능

### 4. 차량 관리 (Buses)

- 차량 목록 조회
- 차량 상세 정보
- 차량 상태 관리
- 차량 정보 수정

### 5. 배차 관리 (Operating Schedule)

- **배차 일정 관리**
  - 날짜별 배차 일정 조회
  - 배차 추가/수정/삭제
  - 드라이버 및 차량 선택
  - 출발/도착 시간 설정
- **날짜/시간 처리**
  - ISO 8601 포맷 지원
  - 다음날 도착 시간 자동 보정
  - 타임존 오프셋 지원

### 6. 실시간 운행 모니터링 (Realtime Operation)

- **Kakao 지도 통합**
  - 실시간 차량 위치 표시
  - 경로 폴리라인 표시
  - 출발지/도착지 마커
- **실시간 데이터 스트리밍**
  - WebSocket (STOMP) 기반 위치 업데이트 (10초 주기)
  - OBD(On-Board Diagnostics) 데이터 수신
  - 운행 이벤트 실시간 수신
- **KPI 모니터링**
  - 현재 속도
  - RPM (엔진 회전수)
  - SOC (배터리 충전 상태)
  - 연료 레벨
  - 엔진 온도
- **데이터 Stale 감지**
  - 예상 수신 주기 대비 3배 초과 시 경고
  - 위치 및 OBD 데이터 별도 stale 판단

### 7. 운행 상세 (Drive Detail)

- 특정 배차의 전체 운행 기록 조회
- 운행 경로 시각화
- 이벤트 타임라인
- 운행 통계 요약

### 8. 알림 시스템 (Notifications)

- **실시간 알림 수신**
  - WebSocket을 통한 Push 알림
  - 토스트 알림 표시
- **알림 관리**
  - 알림 목록 조회
  - 우선순위별 필터링 (HIGH/NORMAL/LOW)
  - 타입별 필터링 (EMERGENCY/WARNING/INFO)
  - 읽음/미읽음 상태 관리
  - 알림 삭제
- **알림 타입**
  - 긴급 알림 (EMERGENCY)
  - 경고 (WARNING)
  - 정보 (INFO)

### 9. 인사이트 (Insight)

- 운행 데이터 분석
- 통계 및 트렌드 시각화
- 성능 지표 모니터링

### 10. 마이페이지 (MyPage)

- 사용자 프로필 조회
- 기본 정보 수정
- 비밀번호 변경
- 프로필 사진 업로드

---

## 🏗️ 기술 스택

### Frontend Framework

- **React 19.1.0** - UI 라이브러리
- **React Router DOM 7.6.0** - 클라이언트 사이드 라우팅
- **React Scripts 5.0.1** - Create React App 빌드 도구

### 스타일링

- **Tailwind CSS 3.4.17** - 유틸리티 우선 CSS 프레임워크
- **PostCSS 8.5.6** - CSS 후처리
- **Autoprefixer 10.4.21** - 브라우저 호환성

### 상태 관리

- **React Context API** - 전역 상태 관리
  - TokenProvider - 인증 토큰 관리
  - WebSocketProvider - WebSocket 연결 관리
  - NotificationProvider - 알림 상태 관리
  - ToastProvider - 토스트 알림 관리

### HTTP 통신

- **Axios 1.10.0** - HTTP 클라이언트
  - 자동 토큰 주입 인터셉터
  - 401 에러 자동 처리 및 토큰 갱신
  - URL 정규화 및 레거시 API 호환

### 실시간 통신

- **@stomp/stompjs 7.2.0** - STOMP over WebSocket
- **sockjs-client 1.6.1** - WebSocket 폴백

### 지도 API

- **Kakao Maps JavaScript API** - 지도 렌더링 및 위치 표시

### 날짜 처리

- **Day.js 1.11.18** - 날짜/시간 파싱 및 포맷팅

### 차트 및 시각화

- **Recharts 3.2.1** - 반응형 차트 라이브러리

### 아이콘

- **React Icons 5.5.0** - 아이콘 컴포넌트 라이브러리

### 테스팅

- **@testing-library/react 16.3.0**
- **@testing-library/jest-dom 6.6.3**
- **@testing-library/user-event 13.5.0**

---

## 📁 프로젝트 구조

```
react-front/
├── public/                      # 정적 파일
│   ├── index.html              # HTML 템플릿
│   ├── manifest.json           # PWA 매니페스트
│   └── robots.txt              # 크롤러 설정
│
├── src/
│   ├── api/                    # API 관련
│   │   ├── client.js          # Axios 인스턴스
│   │   ├── setupAxios.js      # Axios 초기 설정
│   │   └── notifications.js   # 알림 API
│   │
│   ├── components/             # 재사용 컴포넌트
│   │   ├── Bus/               # 버스 관련 컴포넌트
│   │   ├── Dashboard/         # 대시보드 컴포넌트
│   │   │   └── charts/       # 차트 컴포넌트
│   │   ├── Driver/            # 운전자 관련 컴포넌트
│   │   ├── Layout/            # 레이아웃 컴포넌트
│   │   ├── Map/               # 지도 관련 컴포넌트
│   │   ├── Notification/      # 알림 컴포넌트
│   │   │   └── contexts/     # 알림 Context Provider
│   │   ├── Profile/           # 프로필 컴포넌트
│   │   ├── Schedule/          # 스케줄 관련 컴포넌트
│   │   ├── SideBar/           # 사이드바
│   │   ├── Toast/             # 토스트 알림 Provider
│   │   ├── Token/             # 토큰 관리 Provider
│   │   ├── TopNav/            # 상단 네비게이션
│   │   └── WebSocket/         # WebSocket Provider
│   │
│   ├── hooks/                  # Custom React Hooks
│   │   ├── useBusAPI.js
│   │   ├── useDashboardData.js
│   │   ├── useDriveDetailAPI.js
│   │   ├── useDriverAPI.js
│   │   ├── useDriverDispatchAPI.js
│   │   ├── useInsightData.js
│   │   ├── useLiveDispatch.js  # 실시간 운행 데이터
│   │   ├── useOperatingSchedule.js
│   │   └── useScheduleAPI.js
│   │
│   ├── pages/                  # 페이지 컴포넌트
│   │   ├── Auth.jsx           # 인증 페이지
│   │   ├── Signin.jsx         # 로그인
│   │   ├── Signup.jsx         # 회원가입
│   │   ├── Home.jsx           # 홈
│   │   ├── Dashboard.jsx      # 대시보드
│   │   ├── Drivers.jsx        # 운전자 목록
│   │   ├── Buses.jsx          # 버스 목록
│   │   ├── OperatingSchedule.jsx # 배차 관리
│   │   ├── RealtimeOperation.jsx # 실시간 운행
│   │   ├── DriveDetail.jsx    # 운행 상세
│   │   ├── Insight.jsx        # 인사이트
│   │   ├── Notifications.jsx  # 알림 목록
│   │   ├── MyPage.jsx         # 마이페이지
│   │   └── UserDetailPage.jsx # 사용자 상세
│   │
│   ├── styles/                 # 스타일 파일
│   │   └── animations.css     # 애니메이션 정의
│   │
│   ├── utils/                  # 유틸리티 함수
│   │   ├── apiUtils.js        # API 헬퍼 함수
│   │   ├── dateUtils.js       # 날짜 처리 유틸
│   │   └── responseUtils.js   # 응답 처리 유틸
│   │
│   ├── App.jsx                 # 메인 앱 컴포넌트
│   ├── App.css                 # 앱 스타일
│   ├── index.js                # 앱 진입점
│   └── index.css               # 전역 스타일
│
├── docs/                       # 문서
│   └── 지도api 명세서.md
│
├── .env                        # 환경 변수
├── package.json                # 의존성 관리
├── tailwind.config.js          # Tailwind 설정
├── postcss.config.js           # PostCSS 설정
├── README.md                   # 프로젝트 README
└── TOKEN_WEBSOCKET_GUIDE.md    # 토큰/WebSocket 가이드
```

---

## 🔐 인증 및 보안

### JWT 토큰 구조

```javascript
{
  accessToken: string,   // 단기 토큰 (15-30분)
  refreshToken: string,  // 장기 토큰 (7-30일)
  userId: number,
  username: string,
  roles: string[]
}
```

### 인증 플로우

1. 사용자 로그인 → 서버로부터 Access/Refresh Token 수신
2. TokenProvider가 토큰을 localStorage와 메모리에 저장
3. Axios 요청 인터셉터가 모든 요청에 Authorization 헤더 자동 주입
4. 401 응답 수신 시:
   - Refresh Token으로 새 Access Token 발급 시도
   - 성공 시 원래 요청 재시도
   - 실패 시 로그아웃 및 로그인 페이지로 리다이렉션

### 보호된 라우트

- ProtectedRoute 컴포넌트로 인증 필요 페이지 보호
- 토큰 없거나 만료 시 자동 로그인 페이지 리다이렉션
- 역할 기반 접근 제어 (관리자/운전자)

---

## 🔄 실시간 통신 아키텍처

### WebSocket 연결 관리

- **STOMP over SockJS** 프로토콜 사용
- **자동 재연결** 메커니즘 (최대 10회 재시도)
- **Persistent Subscription** 관리
  - 재연결 시 자동 재구독
  - 중복 구독 방지
  - 권한 실패 캐싱 (30초 쿨다운)

### WebSocket 인증

- CONNECT 프레임에만 Authorization 헤더 전송
- SUBSCRIBE/SEND 시에는 토큰 미전송 (보안 단순화)

### 구독 토픽 구조

```javascript
// 개인 알림 큐
/user/queue/notifications

// 배차별 위치 정보
/topic/dispatches/{dispatchId}/location

// 배차별 OBD 데이터
/topic/dispatches/{dispatchId}/obd

// 전역 브로드캐스트
/topic/public
```

### 데이터 스트리밍

- **위치 데이터**: 10초 주기 (향후 1초로 변경 예정)
- **OBD 데이터**: 10초 주기 (향후 1초로 변경 예정)
- **알림**: 실시간 Push

### Stale 데이터 감지

```javascript
EXPECTED_INTERVAL_MS = 10000 (10초)
STALE_THRESHOLD = EXPECTED_INTERVAL_MS * 3 (30초)

// 30초 이상 데이터 수신 없으면 stale 상태로 표시
```

---

## 🗺️ 지도 통합

### Kakao Maps API

- **JavaScript API 사용**
- **환경 변수로 API 키 관리**: `REACT_APP_KAKAO_MAP_API_KEY`
- **주요 기능**:
  - 실시간 차량 위치 마커
  - 경로 폴리라인 표시
  - 출발지/도착지 마커
  - 지도 중심 자동 조정

---

## 📊 데이터 관리 전략

### 날짜/시간 처리

- **Day.js 사용**
- **ISO 8601 포맷 지원**
- **타임존 오프셋**: `REACT_APP_TZ_OFFSET_MINUTES` 환경 변수
- **다음날 도착 시간 자동 보정**
- **서버-클라이언트 시간 동기화**

### 버퍼링 전략 (useLiveDispatch)

```javascript
// 슬라이딩 윈도우 버퍼
BUFFER_WINDOWS = {
  location: 5 * 60 * 1000, // 5분
  obd: 60 * 1000, // 1분
};
```

### API 응답 정규화

- 서버 응답 envelope 언래핑 (`{ success, message, data }`)
- 타입 정규화 (상태 코드, 알림 타입 등)
- 에러 핸들링 통일

---

## 🚀 실행 방법

### 요구 사항

- Node.js 16 이상
- npm 또는 yarn
- Kakao Developers API 키
- 백엔드 API 서버 (기본: http://localhost:8080)

### 환경 변수 설정 (.env)

```env
# Kakao 지도 API 키 (필수)
REACT_APP_KAKAO_MAP_API_KEY=your_kakao_api_key

# 서버 타임존 보정(분) - 선택사항
REACT_APP_TZ_OFFSET_MINUTES=0

# 백엔드 API baseURL - 선택사항
# REACT_APP_API_BASE=http://localhost:8080

# WebSocket URL - 선택사항
# REACT_APP_WS_URL=http://localhost:8080
```

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:3000)
npm start

# 프로덕션 빌드
npm run build

# 테스트 실행
npm test
```

---

## 🧪 테스트

### 테스트 도구

- Jest (테스트 러너)
- React Testing Library (컴포넌트 테스트)
- User Event (사용자 상호작용 시뮬레이션)

### 테스트 실행

```bash
npm test
```

---

## 📦 빌드 및 배포

### 빌드

```bash
npm run build
```

빌드 결과물은 `build/` 디렉토리에 생성됩니다.

### 배포 준비사항

1. 환경 변수 설정 (Kakao API 키, 백엔드 URL)
2. CORS 설정 확인
3. WebSocket 엔드포인트 설정
4. 프로덕션 빌드 생성
5. 정적 파일 호스팅 서비스에 배포

---

## 🔍 주요 알고리즘 및 로직

### 1. 토큰 자동 갱신 (TokenProvider)

```javascript
// 401 에러 발생 시
1. Refresh Token 존재 여부 확인
2. Single-Flight Queue로 동시 갱신 요청 방지
3. Refresh Token으로 새 Access Token 발급
4. 실패 시 로그아웃 및 리다이렉션
5. 성공 시 원래 요청 재시도
```

### 2. WebSocket 재연결 로직

```javascript
// 연결 끊김 감지 시
1. 재연결 시도 횟수 확인 (최대 10회)
2. Exponential Backoff 적용
3. 재연결 성공 시 Persistent Subscription 복원
4. 권한 실패 시 30초 쿨다운 적용
```

### 3. 실시간 데이터 Stale 감지

```javascript
// useLiveDispatch Hook
1. 마지막 수신 시간 기록
2. 현재 시간 - 마지막 수신 시간 계산
3. 임계값(30초) 초과 시 stale 플래그 설정
4. UI에서 경고 표시
```

### 4. 날짜 다음날 보정

```javascript
// 도착 시간이 출발 시간보다 이르면 다음날로 간주
if (arrivalTime < departureTime) {
  arrivalDate = departureDate.add(1, "day");
}
```

---

## 🎨 UI/UX 특징

### 반응형 디자인

- **Tailwind CSS 유틸리티 클래스 사용**
- **Breakpoints**:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
  - 2xl: 1536px

### 디자인 시스템

- **색상 팔레트**: Tailwind 기본 색상
- **타이포그래피**: 시스템 폰트 스택
- **아이콘**: React Icons (Ionicons 5)
- **애니메이션**: CSS 트랜지션 및 키프레임

### 사용자 피드백

- **토스트 알림**: 성공/에러/정보 메시지
- **로딩 스피너**: 비동기 작업 표시
- **에러 바운더리**: 에러 발생 시 Fallback UI
- **상태 배지**: 운행 상태, 알림 우선순위 시각화

---

## 📚 API 명세

### 인증 API

```
POST /api/auth/signin - 로그인
POST /api/auth/signup - 회원가입
POST /api/auth/refresh - 토큰 갱신
POST /api/auth/signout - 로그아웃
```

### 운전자 API

```
GET    /api/admin/drivers - 운전자 목록 조회
GET    /api/admin/drivers/:id - 운전자 상세 조회
POST   /api/admin/drivers - 운전자 추가
PUT    /api/admin/drivers/:id - 운전자 수정
DELETE /api/admin/drivers/:id - 운전자 삭제
```

### 배차 API

```
GET    /api/admin/dispatches - 배차 목록 조회
GET    /api/admin/dispatches/:id - 배차 상세 조회
POST   /api/admin/dispatches - 배차 추가
PUT    /api/admin/dispatches/:id - 배차 수정
DELETE /api/admin/dispatches/:id - 배차 삭제
GET    /api/admin/dispatches/:id/events - 운행 이벤트 조회
POST   /api/admin/dispatches/:id/end - 운행 종료
```

### 알림 API

```
GET    /api/notifications/me - 내 알림 목록
PUT    /api/notifications/:id/read - 알림 읽음 처리
DELETE /api/notifications/:id - 알림 삭제
```

### WebSocket 엔드포인트

```
/ws - WebSocket 연결
```

---

## 🛠️ 개발 가이드

### 코드 스타일

- ESLint 설정: `react-app` 프리셋
- 함수형 컴포넌트 및 Hooks 사용
- Props destructuring 권장
- 명확한 변수/함수 네이밍

### 컴포넌트 구조

```jsx
// 1. Import statements
// 2. Component definition
// 3. State and hooks
// 4. Event handlers
// 5. Effects
// 6. Render logic
```

### Context Provider 사용 패턴

```jsx
// Provider 생성
export const MyProvider = ({ children }) => {
  const [state, setState] = useState();
  return (
    <MyContext.Provider value={{ state, setState }}>
      {children}
    </MyContext.Provider>
  );
};

// Custom Hook
export const useMyContext = () => {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error("useMyContext must be used within MyProvider");
  }
  return context;
};
```

### API 호출 패턴

```javascript
// Custom Hook에서 API 호출
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  async function fetchData() {
    try {
      setLoading(true);
      const response = await axios.get("/api/endpoint");
      setData(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }
  fetchData();
}, [dependencies]);
```

---

## 📝 TODO 및 개선 사항

### 문서화된 TODO 항목 (TOKEN_WEBSOCKET_GUIDE.md 기준)

#### #35: Token Refresh 후 WebSocket 재연결

- **현재 상태**: AccessToken 갱신 후 WebSocket 자동 재연결 미구현
- **영향**: 갱신된 토큰이 WebSocket 연결에 반영되지 않음
- **해결 방안**: TokenProvider에서 lastRefreshTimestamp 노출 → WebSocketProvider가 감지 후 debounce 재연결

#### #36: 401 에러 코드 표준화

- **현재 상태**: 에러 메시지/상태로 휴리스틱 판단
- **개선 필요**: 서버 에러 코드 기반 분기 (ACCESS_EXPIRED, REFRESH_EXPIRED, INVALID_SIGNATURE 등)

#### #29: useLiveDispatch 의존성 최소화

- **현재 상태**: Effect dependency 과다로 불필요한 재구독 발생 가능
- **개선 필요**: 의존성 배열 최적화

#### #30: Unsubscribe 경고 제거

- **현재 상태**: 활성 구독 없는 상태에서 구독 해제 시 경고 발생
- **개선 필요**: 경고 조건 개선

#### #21: 백엔드 Topic/스키마 문서화

- **현재 상태**: WebSocket topic 및 메시지 스키마 문서 부족
- **개선 필요**: API 명세서에 WebSocket 스키마 추가

---

## ⚠️ 알려진 제한사항

### 1. 브라우저 호환성

- 현대 브라우저만 지원 (Chrome, Firefox, Safari, Edge 최신 버전)
- IE11 미지원

### 2. WebSocket 연결

- 프록시/방화벽 환경에서 WebSocket 연결 실패 가능
- SockJS Fallback 제공하지만 성능 저하 가능

### 3. 지도 API

- Kakao Maps API 키 필수
- API 사용량 제한 존재
- 오프라인 환경에서 지도 사용 불가

### 4. 실시간 데이터

- 데이터 수신 주기 10초 (향후 1초로 개선 예정)
- 네트워크 지연 시 stale 데이터 경고 발생 가능

### 5. 토큰 갱신

- Refresh Token 갱신 실패 시 강제 로그아웃
- 동시 다발 401 에러 시 Single-Flight Queue로 제어하지만 일부 요청 지연 가능

---

## 🔒 보안 고려사항

### 1. 토큰 저장

- localStorage 사용 (XSS 취약점 존재)
- 향후 httpOnly 쿠키로 마이그레이션 권장

### 2. API 통신

- HTTPS 사용 필수 (프로덕션)
- CORS 정책 설정 필요

### 3. WebSocket 보안

- CONNECT 시에만 토큰 전송
- 권한 없는 topic 구독 시 서버에서 차단

### 4. 환경 변수

- .env 파일은 .gitignore에 추가됨
- 민감한 정보는 환경 변수로 관리

---

## 📞 문의 및 지원

### 문서

- [README.md](README.md) - 프로젝트 개요 및 실행 방법
- [TOKEN_WEBSOCKET_GUIDE.md](TOKEN_WEBSOCKET_GUIDE.md) - 인증 및 WebSocket 가이드
- [docs/지도api 명세서.md](docs/지도api%20명세서.md) - 지도 API 사용법

---

## 📄 라이선스

이 프로젝트의 라이선스는 명시되지 않았습니다. (`package.json`에서 `"private": true`로 설정됨)

---

## 🙏 감사의 글

이 프로젝트는 캡스톤 디자인 프로젝트로 개발되었습니다.

---

**마지막 업데이트**: 2026년 1월 8일
