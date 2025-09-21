# 버스 운전자 관리 시스템 (Driver Management System) - 프로젝트 명세서

## 📋 프로젝트 개요

### 🎯 프로젝트 명
**운전의 진수 (Driver Management System)**

### 📝 프로젝트 설명
버스 운전자와 차량을 종합적으로 관리하는 웹 기반 SaaS 플랫폼입니다. 실시간 운전자 위치 추적, 배차 관리, 이상 감지 시스템, 알림 관리 등을 통해 버스 운영의 효율성과 안전성을 극대화합니다.

### 🛠️ 기술 스택
- **Frontend Framework**: React 19.1.0
- **Styling**: Tailwind CSS 3.4.17
- **Routing**: React Router DOM 7.6.0
- **HTTP Client**: Axios 1.10.0
- **Icons**: React Icons 5.5.0 (Ionicons5)
- **Date/Time**: Day.js 1.11.18
- **State Management**: React Context API
- **Map Integration**: Kakao Map API
- **Build Tool**: React Scripts 5.0.1

---

## 🏗️ 프로젝트 구조

### 📁 디렉토리 구조
```
src/
├── pages/                      # 페이지 컴포넌트
│   ├── Dashboard.jsx          # 대시보드 (메인 화면)
│   ├── Signin.jsx             # 로그인 페이지
│   ├── Signup.jsx             # 회원가입 페이지
│   ├── Drivers.jsx            # 운전자 관리 페이지
│   ├── Buses.jsx              # 버스 관리 페이지
│   ├── OperatingSchedule.jsx  # 운행 스케줄 페이지
│   ├── Insight.jsx            # 인사이트/지도 페이지
│   ├── UserDetailPage.jsx     # 운전자 상세 페이지
│   ├── DriveDetail.jsx        # 배차 상세 페이지
│   ├── MyPage.jsx             # 마이페이지
│   └── Notifications.jsx      # 알림 페이지
├── components/                 # 재사용 컴포넌트
│   ├── Layout/                # 레이아웃 컴포넌트
│   │   └── Layout.jsx
│   ├── SideBar/               # 사이드바 컴포넌트
│   │   └── SideBar.jsx
│   ├── TopNav/                # 상단 네비게이션
│   │   └── TopNav.jsx
│   ├── Driver/                # 운전자 관련 컴포넌트
│   │   ├── DriverContext.jsx  # 운전자 상태 관리
│   │   ├── DriverListPanel.jsx
│   │   ├── DriverCard.jsx
│   │   ├── DriverDetailModal.jsx
│   │   ├── AddDriverModal.jsx
│   │   └── EditDriverModal.jsx
│   ├── Bus/                   # 버스 관련 컴포넌트
│   │   ├── BusContext.jsx     # 버스 상태 관리
│   │   ├── BusListPanel.jsx
│   │   ├── BusCard.jsx
│   │   └── BusDetailModal.jsx
│   ├── Schedule/              # 스케줄 관련 컴포넌트
│   │   ├── ScheduleContext.jsx # 스케줄 상태 관리
│   │   ├── ScheduleModal.jsx
│   │   ├── AddSchedule.jsx
│   │   ├── BusSelector.jsx
│   │   ├── DriverSelector.jsx
│   │   └── DateTimeInputs.jsx
│   ├── Map/                   # 지도 컴포넌트
│   │   └── Map.jsx
│   ├── Notification/          # 알림 시스템
│   │   ├── NotificationPanel.jsx
│   │   ├── AlertSummaryWidget.jsx
│   │   └── contexts/
│   │       └── NotificationContext.jsx
│   ├── Profile/               # 프로필 관련
│   │   ├── ProfileHeader.jsx
│   │   ├── BasicInfoForm.jsx
│   │   ├── PasswordChangeForm.jsx
│   │   └── ProfileActions.jsx
│   ├── Toast/                 # 토스트 알림
│   │   └── ToastProvider.jsx
│   ├── Token/                 # 인증 토큰 관리
│   │   └── TokenProvider.jsx
│   └── WebSocket/             # 웹소켓 연결
│       └── WebSocketProvider.jsx
└── 명세서 모음/                # 프로젝트 문서
    ├── 기능.md
    ├── 버스.md
    ├── Table.md
    ├── API_IMPROVEMENT_PROPOSAL.md
    ├── COMPLETE_API_REFERENCE.md
    ├── COMPLETE_API_SCENARIOS.md
    ├── FINAL_API_SUMMARY.md
    └── JWT_TOKEN_IMPLEMENTATION_REPORT.md
```

---

## 🎛️ 상태 관리 아키텍처

### Context API 기반 전역 상태 관리

#### 1. TokenProvider
- **역할**: JWT 인증 토큰 관리
- **기능**: 로그인/로그아웃, 토큰 저장/검증
- **위치**: `src/components/Token/TokenProvider.jsx`

#### 2. DriverProvider
- **역할**: 운전자 데이터 및 상태 관리
- **기능**: 운전자 목록, CRUD 작업, 상태 업데이트
- **위치**: `src/components/Driver/DriverContext.jsx`
- **주요 상태**:
  - `drivers`: 운전자 목록
  - `loading`: 로딩 상태
  - `error`: 에러 상태

#### 3. BusProvider
- **역할**: 버스 데이터 및 상태 관리
- **기능**: 버스 목록, CRUD 작업, 상태 업데이트
- **위치**: `src/components/Bus/BusContext.jsx`

#### 4. ScheduleProvider
- **역할**: 배차/스케줄 데이터 관리
- **기능**: 스케줄 조회, 생성, 수정, 삭제
- **위치**: `src/components/Schedule/ScheduleContext.jsx`
- **주요 기능**:
  - `fetchSchedulesByDate()`: 날짜별 스케줄 조회
  - `addSchedule()`: 새 스케줄 추가
  - `updateSchedule()`: 스케줄 수정
  - `deleteSchedule()`: 스케줄 삭제

#### 5. NotificationContext
- **역할**: 알림 시스템 상태 관리
- **기능**: 알림 생성, 읽음 처리, 필터링, 통계
- **위치**: `src/components/Notification/contexts/NotificationContext.jsx`

#### 6. ToastProvider
- **역할**: 사용자 피드백 메시지 관리
- **기능**: 성공/에러/경고 토스트 표시
- **위치**: `src/components/Toast/ToastProvider.jsx`

---

## 🛣️ 라우팅 구조

### 보호된 라우트 시스템
```jsx
// 인증이 필요한 라우트는 ProtectedRoute로 래핑
const ProtectedRoute = ({ children }) => {
  const { getToken } = useToken();
  const token = getToken();
  return children; // 현재는 모든 접근 허용 (개발 모드)
  // return token ? children : <Navigate to="/signin" replace />;
};
```

### 주요 라우트 구성
| 경로 | 컴포넌트 | 설명 | 보호 여부 |
|------|----------|------|-----------|
| `/` | RootRedirect | 루트 리다이렉트 | - |
| `/signin` | Signin | 로그인 페이지 | 공개 |
| `/signup` | Signup | 회원가입 페이지 | 공개 |
| `/dashboard` | Dashboard | 메인 대시보드 | 보호됨 |
| `/drivers` | Drivers | 운전자 관리 | 보호됨 |
| `/buses` | Buses | 버스 관리 | 보호됨 |
| `/operating-schedule` | OperatingSchedule | 운행 스케줄 | 보호됨 |
| `/insight` | Insight | 인사이트/지도 | 보호됨 |
| `/userdetailpage/:id` | UserDetailPage | 운전자 상세 | 보호됨 |
| `/drivedetail/:id` | DriveDetail | 배차 상세 | 보호됨 |
| `/mypage` | MyPage | 마이페이지 | 보호됨 |

---

## 🎨 UI/UX 디자인 시스템

### 디자인 원칙
1. **일관성**: 전체 애플리케이션에서 통일된 디자인 언어
2. **접근성**: 명확한 색상 대비와 직관적인 아이콘 사용
3. **반응성**: 모바일부터 데스크톱까지 완벽한 반응형 디자인
4. **현대성**: 모던하고 깔끔한 SaaS 스타일 인터페이스

### 색상 체계
- **Primary**: 파란색 계열 (텍스트, 액션 버튼)
- **Success**: 초록색 (완료, 성공 상태)
- **Warning**: 주황색 (경고, 지연 상태)
- **Error**: 빨간색 (오류, 위험 상태)
- **Gray Scale**: 다양한 회색 음영 (배경, 텍스트)

### 레이아웃 패턴
1. **사이드바 + 메인 콘텐츠**: 전체 페이지 기본 레이아웃
2. **카드 기반**: 정보 그룹화를 위한 카드 컴포넌트
3. **패널 분할**: 좌측/우측 패널로 정보 구성
4. **모달 시스템**: 상세 정보 표시 및 폼 입력

---

## 🔧 주요 기능 명세

### 1. 대시보드 (Dashboard)
- **경로**: `/dashboard`
- **주요 기능**:
  - 오늘의 운행 스케줄 요약
  - 운행 중인 운전자 현황
  - 주요 통계 지표 표시
  - 빠른 액션 버튼

### 2. 인사이트/지도 (Insight)
- **경로**: `/insight`
- **주요 기능**:
  - Kakao Map 기반 실시간 위치 추적
  - 운전자별 마커 표시
  - 우측 운전자 리스트 패널
  - 운전자 상태별 필터링
  - 실시간 상태 업데이트

### 3. 운전자 관리 (Drivers)
- **경로**: `/drivers`
- **주요 기능**:
  - 운전자 목록 조회
  - 운전자 추가/수정/삭제
  - 상태별 필터링 (대기, 운행중, 휴가, 비활성)
  - 운전자 상세 정보 조회

### 4. 버스 관리 (Buses)
- **경로**: `/buses`
- **주요 기능**:
  - 버스 목록 조회
  - 버스 정보 관리
  - 상태별 필터링
  - 버스별 운행 이력

### 5. 운행 스케줄 (OperatingSchedule)
- **경로**: `/operating-schedule`
- **주요 기능**:
  - 날짜별 스케줄 조회
  - 스케줄 생성/수정/삭제
  - 운전자-버스 배정
  - 상태별 필터링 (예정, 운행중, 완료, 지연)

### 6. 운전자 상세 (UserDetailPage)
- **경로**: `/userdetailpage/:id`
- **주요 기능**:
  - 운전자 개인 정보 상세 조회
  - 배차 이력 관리
  - 경고 이력 조회
  - 날짜 범위 필터링
  - 통계 정보 표시

### 7. 배차 상세 (DriveDetail)
- **경로**: `/drivedetail/:id`
- **주요 기능**:
  - 특정 배차 상세 정보
  - 이상감지 통계 표시
  - 경고 이력 목록 (시간순 정렬)
  - 운전자/버스 정보 표시

---

## 🔌 API 연동 구조

### HTTP 클라이언트 설정
```javascript
// axios 기본 설정
axios.defaults.baseURL = "http://localhost:8080";

// 인증 헤더 자동 추가
headers: { Authorization: `Bearer ${getToken()}` }
```

### 주요 API 엔드포인트

#### 인증 관련
- `POST /api/auth/signin` - 로그인
- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/refresh` - 토큰 갱신

#### 운전자 관리
- `GET /api/drivers` - 운전자 목록 조회
- `GET /api/drivers/:id` - 특정 운전자 조회
- `POST /api/drivers` - 운전자 생성
- `PUT /api/drivers/:id` - 운전자 정보 수정
- `DELETE /api/drivers/:id` - 운전자 삭제

#### 버스 관리
- `GET /api/buses` - 버스 목록 조회
- `GET /api/buses/:id` - 특정 버스 조회
- `POST /api/buses` - 버스 등록
- `PUT /api/buses/:id` - 버스 정보 수정

#### 스케줄/배차 관리
- `GET /api/dispatch/date?date=YYYY-MM-DD` - 날짜별 스케줄 조회
- `GET /api/dispatch/:id` - 특정 배차 조회
- `POST /api/dispatch` - 새 배차 생성
- `PUT /api/dispatch/:id` - 배차 정보 수정
- `DELETE /api/dispatch/:id` - 배차 삭제

#### 경고/알림 시스템
- `GET /api/warnings/dispatch/:id` - 배차별 경고 조회
- `GET /api/warnings/driver/:id` - 운전자별 경고 조회
- `GET /api/notifications` - 알림 목록 조회
- `PUT /api/notifications/:id/read` - 알림 읽음 처리

---

## 🚨 에러 처리 및 목업 데이터

### 에러 처리 전략
1. **API 실패 시 목업 데이터 제공**: 개발 중 백엔드 미완성 상황 대응
2. **Toast 알림**: 사용자 친화적 에러 메시지 표시
3. **로딩 상태 관리**: 사용자 경험 향상을 위한 로딩 인디케이터
4. **에러 바운더리**: 예상치 못한 에러에 대한 fallback UI

### 목업 데이터 예시
```javascript
// 운전자 목업 데이터
const mockDrivers = [
  {
    id: 1,
    name: "김운전",
    phoneNumber: "010-1234-5678",
    licenseType: "1종 보통",
    status: "ACTIVE"
  }
];

// 경고 목업 데이터 (DriveDetail 페이지)
const mockWarnings = [
  {
    warningTime: "2024-01-15T09:30:00",
    warningType: "Drowsiness",
    description: "졸음운전이 감지되었습니다."
  }
];
```

---

## 🎯 개발 특징 및 베스트 프랙티스

### 1. 컴포넌트 설계 원칙
- **단일 책임 원칙**: 각 컴포넌트는 하나의 명확한 역할
- **재사용성**: 공통 컴포넌트의 prop 기반 커스터마이징
- **가독성**: 명확한 컴포넌트명과 구조화된 코드

### 2. 상태 관리 패턴
- **Context API 활용**: Redux 없이 효율적인 전역 상태 관리
- **로컬 상태 우선**: 컴포넌트별 필요에 따른 useState 활용
- **에러 분리**: 각 Context별 독립적인 에러 상태 관리

### 3. 성능 최적화
- **지연 로딩**: React.lazy를 통한 코드 스플리팅 준비
- **메모이제이션**: 필요시 React.memo, useMemo, useCallback 활용
- **효율적인 리렌더링**: 불필요한 렌더링 방지

### 4. 사용자 경험 (UX)
- **반응형 디자인**: 모든 기기에서 최적화된 경험
- **직관적 네비게이션**: 명확한 메뉴 구조와 브레드크럼
- **실시간 피드백**: 로딩 상태, 성공/에러 메시지 즉시 표시

---

## 📱 반응형 디자인

### 브레이크포인트
- **Mobile**: < 768px
- **Tablet**: 768px - 1023px  
- **Desktop**: ≥ 1024px

### Tailwind CSS 유틸리티 활용
```css
/* 예시: 반응형 그리드 레이아웃 */
grid grid-cols-1 lg:grid-cols-4 gap-6

/* 예시: 반응형 텍스트 크기 */
text-sm md:text-base lg:text-lg
```

---

## 🔮 확장 가능성

### 1. 추가 예정 기능
- **실시간 알림**: WebSocket 기반 실시간 업데이트
- **상세 분석**: 운전 패턴 분석 및 리포트
- **모바일 앱**: React Native 기반 모바일 확장
- **다국어 지원**: i18n 라이브러리 도입

### 2. 기술적 확장
- **상태 관리**: Redux Toolkit으로 마이그레이션 고려
- **테스팅**: Jest, React Testing Library 도입
- **타입 안정성**: TypeScript 마이그레이션
- **PWA**: Progressive Web App 기능 추가

---

## 🔧 개발 환경 설정

### 필수 요구사항
- **Node.js**: 16.x 이상
- **npm**: 8.x 이상
- **Kakao Developers**: 지도 API 키 필요

### 설치 및 실행
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm start

# 빌드
npm run build

# 테스트 실행
npm test
```

### 환경 변수
```env
REACT_APP_KAKAO_MAP_API_KEY=your_kakao_api_key
REACT_APP_API_BASE_URL=http://localhost:8080
```

---

## 📚 관련 문서

프로젝트의 상세한 기술 문서는 `src/명세서 모음/` 디렉토리에서 확인할 수 있습니다:

- **기능.md**: 주요 기능별 상세 설명
- **Table.md**: 데이터베이스 테이블 구조
- **COMPLETE_API_REFERENCE.md**: 완전한 API 레퍼런스
- **JWT_TOKEN_IMPLEMENTATION_REPORT.md**: 인증 시스템 구현 보고서

---

이 명세서는 프로젝트의 전반적인 구조와 주요 특징을 포괄적으로 다루며, AI 어시스턴트가 프로젝트를 이해하고 효과적으로 지원할 수 있도록 필요한 모든 정보를 제공합니다.