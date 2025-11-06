# 운전의 진수 (Driver Management System)

현대적인 SaaS 스타일의 버스/운전자/배차 관리 프론트엔드 애플리케이션입니다. React + Tailwind로 구성되어 있으며, Kakao 지도와 실시간 알림/운행 데이터 연동을 지원합니다.

## 🧭 목차
- 프로젝트 개요
- 기술 스택
- 실행 방법 (환경 변수 포함)
- 데이터 관리 설계
- 인증/토큰 흐름
- 페이지별 구현 개요 (스크린샷 자리 표시 포함)
- 지도 API & 구현 방식
- 디렉터리 구조
- 개발/품질 가이드 (Lint/빌드/테스트)

---

## � 프로젝트 개요
운전자, 차량, 배차(운행) 및 알림을 관리/모니터링하는 관리자 웹입니다. 오늘의 운행 현황, 실시간 운행 페이지, 알림 목록, 배차/운전자 상세/편집 등 운영에 필요한 화면들을 제공합니다.

## �️ 기술 스택
- Frontend: React 18, Vite/Cra 기반 빌드 (현재 package.json 기준 CRA)
- Styling: Tailwind CSS
- Routing: React Router v6
- HTTP: Axios (+ 인터셉터)
- State: React Context (Token, Notification 등)
- Maps: Kakao Maps JavaScript API

## 🚀 실행 방법

### 요구 사항
- Node.js 16 이상 권장
- npm 또는 yarn
- Kakao Developers 발급 JS 키
- 백엔드 API (기본: http://localhost:8080)

### 설치
```bash
git clone https://github.com/ed-capstone-design/react-front.git
cd react-front
npm install
```

### 환경 변수 (.env)
```env
# Kakao 지도 API 키 (필수)
REACT_APP_KAKAO_MAP_API_KEY=YOUR_KAKAO_JS_KEY

# (선택) 서버 타임존 보정(분)
REACT_APP_TZ_OFFSET_MINUTES=0

# (선택) 백엔드 API baseURL, 전역 axios.defaults.baseURL이 이미 8080으로 셋업되지만 필요 시 오버라이드
# REACT_APP_API_BASE=http://localhost:8080
```

변경 후 개발 서버를 재시작해야 지도 스크립트 키가 반영됩니다.

### 실행/빌드
```bash
npm start   # 개발 서버 (http://localhost:3000)
npm run build  # 프로덕션 빌드
```

---

## � 데이터 관리 설계

### 1) API 클라이언트/설정
- `src/api/setupAxios.js`: 앱 부팅 시점에 axios 기본값(baseURL, Authorization) 주입
- `src/api/client.js`: 필요 시 사용할 수 있는 별도 axios 인스턴스 (baseURL만 지정)

### 2) 토큰/사용자 정보 관리 (인증)
- `src/components/Token/TokenProvider.jsx`
  - accessToken/refreshToken을 localStorage에 저장하고, axios 인터셉터로 Authorization 헤더 자동 주입
  - `/api/auth/refresh`로 Access Token 갱신, 401 응답에 대한 자동 재시도/로그아웃 처리
  - `getUserInfoFromToken()` 유틸로 JWT에서 사용자 정보 파싱

요약 흐름:
- 로그인 성공 → access/refresh 저장 → Authorization 헤더 설정 → 사용자 정보 저장
- 요청 중 401 → refresh 시도 성공 시 재요청, 실패 시 로그아웃 및 `/signin` 이동

### 3) 날짜/시간 처리
- `src/hooks/useDashboardData.js` 등: ISO/epoch/HH:mm 혼합 포맷을 정규화, 도착시간 다음날 보정 로직 포함
- `REACT_APP_TZ_OFFSET_MINUTES`로 서버-클라이언트 타임존 차를 보정 가능

### 4) 알림 관리
- `src/components/Notification/NotificationProvider.jsx` (contexts 폴더)
  - 알림 목록, 미읽음 카운트, 실시간 갱신 버전 관리
  - 페이지에서 `useNotification()`으로 구독

---

## 🔐 인증/토큰 흐름

1) 로그인 시 서버가 `{ accessToken, refreshToken, userId, username, roles }` 형태 반환
2) `TokenProvider.login()`이 토큰/유저정보 저장, axios Authorization 설정
3) 모든 요청은 인터셉터가 최신 accessToken을 Authorization 헤더로 주입
4) 401 발생 시 refresh 시도 → 성공 시 재시도, 실패 시 토큰 제거 후 `/signin` 이동

필요 시 로컬 디버깅을 위해 `localStorage.setItem('DEBUG_AXIOS','1')` 설정하면 콘솔에 요청/토큰 로그가 출력됩니다.

---

## 📄 페이지별 구현 개요 (스크린샷 자리 표시)

> 아래 각 섹션에는 나중에 실제 스크린샷(이미지)을 추가하세요. `docs/` 폴더에 이미지를 넣고 상대경로로 연결하면 됩니다.

### 대시보드 (`src/pages/Dashboard.jsx`)
- 오늘의 운행현황: 예정/운행중/완료 탭 및 리스트
- 주간/시간대 분포 차트
- 데이터 소스: `useDashboardData`

스크린샷: ![dashboard](docs/images/dashboard.png)

### 운전자 목록/상세 (`src/components/Driver/*`, `src/pages/Drivers.jsx`)
- 카드/리스트/모달 구성
- 실시간 상태 뱃지 표시

스크린샷: ![drivers](docs/images/drivers.png)

### 배차 운영 스케줄 (`src/pages/OperatingSchedule.jsx`)
- 날짜/시간 통합 정규화, 도착 다음날 보정
- 배차 추가/수정 모달 구성

스크린샷: ![schedule](docs/images/schedule.png)

### 실시간 운행 (`src/pages/RealtimeOperation.jsx`)
- Kakao 지도 + 현재 위치 마커
- OBD/KPI 카드, 운행 이벤트 리스트
- 알림 수신 시 이벤트 자동 갱신

스크린샷: ![realtime](docs/images/realtime.png)

### 알림 목록 (`src/pages/Notifications.jsx`)
- 우선순위/타입 필터링, 읽음 처리
- 요약 위젯(`AlertSummaryWidget`)

스크린샷: ![notifications](docs/images/notifications.png)

### 프로필/설정 (`src/pages/MyPage.jsx` & `src/components/Profile/*`)
- 기본 정보/비밀번호 변경 폼

스크린샷: ![mypage](docs/images/mypage.png)

---

## � 지도 API & 구현 방식

### Kakao 지도 연동 구조
- `src/components/Map/KakaoMapContainer.jsx`
  - Kakao JS SDK를 동적으로 로드하고, 지도 객체를 생성
  - 자식 컴포넌트에 `map` prop을 주입(React.cloneElement)
  - 예시 사용:
    ```jsx
    <KakaoMapContainer center={{lat, lng}} height="480px">
      <RealtimeMarkers drivers={[{ lat, lng, label: '현위치' }]} />
    </KakaoMapContainer>
    ```
- `src/components/Map/RealtimeMarkers.jsx`
  - 전달받은 `drivers` 배열을 순회하며 커스텀 오버레이 생성
  - `map` 변경/언마운트 시 정리(cleanup)

주의:
- `.env`의 `REACT_APP_KAKAO_MAP_API_KEY`가 없으면 안내 박스를 렌더링하고 지도는 생성되지 않습니다.

---

## 📁 디렉터리 구조

> 실제 구조를 요약하여 핵심만 정리했습니다.

```
src/
  api/
    client.js           # axios 인스턴스
    setupAxios.js       # 전역 axios 기본값/헤더 주입
  components/
    Map/
      KakaoMapContainer.jsx
      RealtimeMarkers.jsx
    Notification/
      NotificationProvider.jsx
      NotificationCountProvider.jsx
      AlertSummaryWidget.jsx
      contexts/
    Token/
      TokenProvider.jsx
    ...
  hooks/
    useDashboardData.js
    useOperatingSchedule.js
    useLiveDispatch.js
    ...
  pages/
    Dashboard.jsx
    Drivers.jsx
    OperatingSchedule.jsx
    RealtimeOperation.jsx
    Notifications.jsx
    Auth.jsx / Signin.jsx / Signup.jsx
    ...
  utils/
    apiUtils.js
```

---

## 🧪 개발/품질 가이드

### Lint/Format
- ESLint/Prettier 설정(CRA 기본 + 프로젝트 규칙)을 따릅니다.

### 환경별 설정
- 개발: `npm start` — http://localhost:3000
- API 기본 주소: `http://localhost:8080` (setupAxios/TokenProvider에서 기본값 주입)

### 트러블슈팅 체크리스트
- 지도 마커가 보이지 않음
  - `<KakaoMapContainer>` 안에 마커 컴포넌트를 children으로 렌더링했는지 확인
  - `REACT_APP_KAKAO_MAP_API_KEY` 설정/재시작 여부 확인
  - 좌표가 문자열이면 Number 변환 필요 (`Number(lat)`, `Number(lng)`)
- 401 응답 반복
  - refresh 토큰 유효성 확인 (서버 재시작 시 무효화 가능)
  - 실패 시 자동 로그아웃 후 `/signin` 리다이렉트

---

## 라이선스 & 기여

- 라이선스: MIT (필요 시 조직 정책에 맞춰 변경)
- 기여: PR/이슈 템플릿은 추후 추가 예정

---

## 부록

- 추가 심화 문서는 `docs/` 폴더에 정리합니다.
- 스크린샷은 `docs/images/`에 저장 후 본 README에서 참조하세요.
