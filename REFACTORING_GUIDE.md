# 리팩토링 가이드: 체계적인 프로젝트 개선 로드맵

> **목표**: 스파게티 코드를 방지하면서 점진적으로 프로젝트를 개선하기

## 📖 이 가이드를 읽는 방법

각 단계는 **독립적으로 완료**할 수 있도록 설계되었습니다.

- ✅ 각 단계를 완료할 때마다 **커밋**하세요
- ✅ 한 번에 하나의 단계에만 집중하세요
- ✅ 테스트를 작성하면서 진행하세요
- ❌ 여러 단계를 동시에 진행하지 마세요

---

## 🎯 개선 전략: "점진적 리팩토링"

### 핵심 원칙

1. **작은 단위로 개선** - 한 번에 하나의 문제만 해결
2. **기존 코드를 깨뜨리지 않기** - 기능을 유지하면서 개선
3. **테스트로 검증** - 변경 후 항상 테스트
4. **문서화** - 변경 사항을 기록

### 안티패턴 (피해야 할 것)

❌ "전체를 한 번에 다시 작성하자"
❌ "일단 모든 것을 TypeScript로 바꾸자"
❌ "모든 컴포넌트를 동시에 리팩토링하자"
❌ "테스트는 나중에 작성하자"

---

## 📋 5단계 개선 로드맵

```
Phase 0: 준비 (1일)
   ↓
Phase 1: 기초 다지기 (1주)
   ↓
Phase 2: 구조 개선 (1-2주)
   ↓
Phase 3: 품질 향상 (1-2주)
   ↓
Phase 4: 최적화 (1주)
   ↓
Phase 5: 유지보수성 강화 (지속)
```

---

## Phase 0: 준비 단계 (1일) 🛠️

### 목표

안전한 리팩토링을 위한 환경 설정

### 작업 목록

#### 0.1 Git 브랜치 전략 수립

```bash
# 현재 상태 저장
git checkout -b main-backup
git push origin main-backup

# 개발 브랜치 생성
git checkout -b develop
git push origin develop

# 각 개선 작업마다 feature 브랜치 생성
git checkout -b refactor/phase1-constants
```

#### 0.2 개발 환경 설정

```bash
# ESLint 설정 강화
npm install --save-dev eslint-plugin-react-hooks

# Prettier 설치
npm install --save-dev prettier eslint-config-prettier

# Git hooks 설정 (선택)
npm install --save-dev husky lint-staged
```

#### 0.3 `.eslintrc.json` 생성

```json
{
  "extends": ["react-app", "react-app/jest", "plugin:react-hooks/recommended"],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]
  }
}
```

#### 0.4 `.prettierrc.json` 생성

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

#### 0.5 작업 체크리스트 만들기

```bash
# 프로젝트 루트에 체크리스트 생성
touch REFACTORING_CHECKLIST.md
```

---

## Phase 1: 기초 다지기 (1주) 🏗️

### 목표

반복 작업을 줄이고 코드 일관성 확보

---

### 1.1 상수 파일 분리 (우선순위: 🔥 높음)

#### 왜 필요한가?

- 매직 넘버/문자열 제거
- 변경 시 한 곳만 수정
- 코드 가독성 향상

#### 작업 순서

**Step 1**: 상수 폴더 생성

```bash
mkdir src/constants
```

**Step 2**: `src/constants/api.js` 생성

```javascript
// API 엔드포인트 상수
export const API_ENDPOINTS = {
  AUTH: {
    SIGNIN: "/api/auth/signin",
    SIGNUP: "/api/auth/signup",
    REFRESH: "/api/auth/refresh",
    SIGNOUT: "/api/auth/signout",
  },
  ADMIN: {
    DRIVERS: "/api/admin/drivers",
    DRIVER_DETAIL: (id) => `/api/admin/drivers/${id}`,
    BUSES: "/api/admin/buses",
    BUS_DETAIL: (id) => `/api/admin/buses/${id}`,
    DISPATCHES: "/api/admin/dispatches",
    DISPATCH_DETAIL: (id) => `/api/admin/dispatches/${id}`,
    DISPATCH_EVENTS: (id) => `/api/admin/dispatches/${id}/events`,
    DISPATCH_END: (id) => `/api/admin/dispatches/${id}/end`,
  },
  NOTIFICATIONS: {
    LIST: "/api/notifications/me",
    DETAIL: (id) => `/api/notifications/${id}`,
    READ: (id) => `/api/notifications/${id}/read`,
  },
};

// HTTP 상태 코드
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};
```

**Step 3**: `src/constants/config.js` 생성

```javascript
// 애플리케이션 설정
export const APP_CONFIG = {
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8080",
  WS_URL: process.env.REACT_APP_WS_URL || "http://localhost:8080/ws",
  KAKAO_MAP_API_KEY: process.env.REACT_APP_KAKAO_MAP_API_KEY,
  TZ_OFFSET_MINUTES: parseInt(
    process.env.REACT_APP_TZ_OFFSET_MINUTES || "0",
    10
  ),
};

// WebSocket 설정
export const WEBSOCKET_CONFIG = {
  MAX_RECONNECT_ATTEMPTS: 10,
  RECONNECT_DELAY_MS: 3000,
  HEARTBEAT_INTERVAL_MS: 30000,
  PERMISSION_DENIED_COOLDOWN_MS: 30000,
};

// 실시간 데이터 설정
export const DATA_CONFIG = {
  // 현재 10초, 향후 1초로 변경 예정
  LOCATION_UPDATE_INTERVAL_MS: 10000,
  OBD_UPDATE_INTERVAL_MS: 10000,
  STALE_THRESHOLD_MULTIPLIER: 3,
  BUFFER_WINDOW_LOCATION_MS: 5 * 60 * 1000, // 5분
  BUFFER_WINDOW_OBD_MS: 60 * 1000, // 1분
  MAX_BUFFER_SIZE: 1000,
};

// 토큰 설정
export const TOKEN_CONFIG = {
  ACCESS_TOKEN_KEY: "accessToken",
  REFRESH_TOKEN_KEY: "refreshToken",
  LEGACY_TOKEN_KEY: "authToken",
  USER_INFO_KEY: "userInfo",
};

// 디버그 설정
export const DEBUG = {
  AXIOS: localStorage.getItem("DEBUG_AXIOS") === "1",
  WEBSOCKET: localStorage.getItem("DEBUG_WS") === "1",
};
```

**Step 4**: `src/constants/status.js` 생성

```javascript
// 배차 상태
export const DISPATCH_STATUS = {
  SCHEDULED: "SCHEDULED",
  PLANNED: "PLANNED",
  RUNNING: "RUNNING",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  FINISHED: "FINISHED",
  CANCELED: "CANCELED",
  CANCELLED: "CANCELLED",
};

// 상태 정규화 맵
export const DISPATCH_STATUS_MAP = {
  [DISPATCH_STATUS.SCHEDULED]: "SCHEDULED",
  [DISPATCH_STATUS.PLANNED]: "SCHEDULED",
  [DISPATCH_STATUS.RUNNING]: "RUNNING",
  [DISPATCH_STATUS.IN_PROGRESS]: "RUNNING",
  [DISPATCH_STATUS.COMPLETED]: "COMPLETED",
  [DISPATCH_STATUS.FINISHED]: "COMPLETED",
  [DISPATCH_STATUS.CANCELED]: "CANCELED",
  [DISPATCH_STATUS.CANCELLED]: "CANCELED",
};

// 알림 우선순위
export const NOTIFICATION_PRIORITY = {
  LOW: "LOW",
  NORMAL: "NORMAL",
  HIGH: "HIGH",
};

// 알림 타입
export const NOTIFICATION_TYPE = {
  INFO: "INFO",
  WARNING: "WARNING",
  EMERGENCY: "EMERGENCY",
};

// 운전자 상태
export const DRIVER_STATUS = {
  AVAILABLE: "AVAILABLE",
  ON_DUTY: "ON_DUTY",
  OFF_DUTY: "OFF_DUTY",
  BREAK: "BREAK",
};
```

**Step 5**: `src/constants/index.js` 생성 (배럴 export)

```javascript
export * from "./api";
export * from "./config";
export * from "./status";
```

**Step 6**: 기존 코드 업데이트 (점진적으로)

```javascript
// Before
axios.defaults.baseURL = "http://localhost:8080";

// After
import { APP_CONFIG } from "@/constants";
axios.defaults.baseURL = APP_CONFIG.API_BASE_URL;
```

**커밋 포인트**: `git commit -m "refactor: 상수 파일 분리 완료"`

---

### 1.2 유틸리티 함수 정리 (우선순위: 🔥 높음)

#### 작업 순서

**Step 1**: `src/utils/status.js` 생성

```javascript
import { DISPATCH_STATUS_MAP } from "@/constants";

/**
 * 배차 상태를 정규화합니다
 * @param {string} status - 원본 상태
 * @returns {string} 정규화된 상태
 */
export function normalizeDispatchStatus(status) {
  if (!status) return "SCHEDULED";
  const normalized = String(status).trim().toUpperCase();
  return DISPATCH_STATUS_MAP[normalized] || "SCHEDULED";
}

/**
 * 상태별 스타일 클래스를 반환합니다
 * @param {string} status - 배차 상태
 * @returns {string} Tailwind CSS 클래스
 */
export function getStatusBadgeClass(status) {
  const normalized = normalizeDispatchStatus(status);
  const classMap = {
    SCHEDULED: "bg-blue-100 text-blue-800",
    RUNNING: "bg-green-100 text-green-800",
    COMPLETED: "bg-gray-100 text-gray-800",
    CANCELED: "bg-red-100 text-red-800",
  };
  return classMap[normalized] || classMap.SCHEDULED;
}
```

**Step 2**: `src/utils/validation.js` 생성

```javascript
/**
 * 이메일 유효성 검사
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 전화번호 유효성 검사 (한국)
 */
export function isValidPhone(phone) {
  const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
  return phoneRegex.test(phone);
}

/**
 * 비밀번호 강도 검사
 */
export function validatePassword(password) {
  if (password.length < 8) {
    return { valid: false, message: "비밀번호는 8자 이상이어야 합니다" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "소문자를 포함해야 합니다" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "대문자를 포함해야 합니다" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "숫자를 포함해야 합니다" };
  }
  return { valid: true, message: "안전한 비밀번호입니다" };
}
```

**Step 3**: `src/utils/format.js` 생성

```javascript
import dayjs from "dayjs";

/**
 * 날짜를 포맷팅합니다
 */
export function formatDate(date, format = "YYYY-MM-DD") {
  if (!date) return "";
  return dayjs(date).format(format);
}

/**
 * 시간을 포맷팅합니다
 */
export function formatTime(date, format = "HH:mm") {
  if (!date) return "";
  return dayjs(date).format(format);
}

/**
 * 날짜와 시간을 포맷팅합니다
 */
export function formatDateTime(date, format = "YYYY-MM-DD HH:mm") {
  if (!date) return "";
  return dayjs(date).format(format);
}

/**
 * 상대 시간을 반환합니다 (예: "3분 전")
 */
export function formatRelativeTime(date) {
  if (!date) return "";
  const now = dayjs();
  const target = dayjs(date);
  const diffMinutes = now.diff(target, "minute");

  if (diffMinutes < 1) return "방금 전";
  if (diffMinutes < 60) return `${diffMinutes}분 전`;

  const diffHours = now.diff(target, "hour");
  if (diffHours < 24) return `${diffHours}시간 전`;

  const diffDays = now.diff(target, "day");
  if (diffDays < 7) return `${diffDays}일 전`;

  return formatDate(date);
}

/**
 * 숫자를 천 단위로 포맷팅합니다
 */
export function formatNumber(num) {
  if (num == null) return "0";
  return num.toLocaleString("ko-KR");
}

/**
 * 속도를 포맷팅합니다
 */
export function formatSpeed(speed) {
  if (speed == null) return "0 km/h";
  return `${Math.round(speed)} km/h`;
}

/**
 * 퍼센트를 포맷팅합니다
 */
export function formatPercent(value, decimals = 0) {
  if (value == null) return "0%";
  return `${value.toFixed(decimals)}%`;
}
```

**커밋 포인트**: `git commit -m "refactor: 유틸리티 함수 정리 완료"`

---

### 1.3 환경 변수 관리 개선 (우선순위: 🔥 높음)

#### 작업 순서

**Step 1**: 환경별 `.env` 파일 생성

```bash
# 개발 환경
cp .env .env.development

# 스테이징 환경 (샘플)
cat > .env.staging << EOL
REACT_APP_KAKAO_MAP_API_KEY=your_staging_key_here
REACT_APP_API_BASE_URL=https://staging-api.example.com
REACT_APP_WS_URL=https://staging-api.example.com/ws
REACT_APP_TZ_OFFSET_MINUTES=0
EOL

# 프로덕션 환경 (샘플)
cat > .env.production << EOL
REACT_APP_KAKAO_MAP_API_KEY=your_production_key_here
REACT_APP_API_BASE_URL=https://api.example.com
REACT_APP_WS_URL=https://api.example.com/ws
REACT_APP_TZ_OFFSET_MINUTES=0
EOL
```

**Step 2**: `.env.example` 생성

```bash
cat > .env.example << EOL
# Kakao Maps API Key (필수)
REACT_APP_KAKAO_MAP_API_KEY=your_kakao_api_key_here

# Backend API URL (선택, 기본값: http://localhost:8080)
REACT_APP_API_BASE_URL=http://localhost:8080

# WebSocket URL (선택, 기본값: http://localhost:8080/ws)
REACT_APP_WS_URL=http://localhost:8080/ws

# Timezone offset in minutes (선택, 기본값: 0)
REACT_APP_TZ_OFFSET_MINUTES=0
EOL
```

**Step 3**: `.gitignore` 업데이트 확인

```bash
# 이미 포함되어 있는지 확인
cat .gitignore | grep -E "^\.env"

# 없다면 추가 (이미 있음)
# .env
# .env.local
# .env.*.local
```

**Step 4**: 🔴 **중요**: 기존 `.env` 파일의 API 키 재발급

```bash
# 1. Kakao Developers에서 새 API 키 발급
# 2. .env 파일 업데이트
# 3. 기존 키 비활성화
# 4. Git history에서 제거 (필요시)

# Git history에서 .env 제거 (선택)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

**커밋 포인트**: `git commit -m "chore: 환경 변수 관리 개선"`

---

### 1.4 API 클라이언트 개선 (우선순위: 🟡 중간)

#### 작업 순서

**Step 1**: `src/api/config.js` 생성

```javascript
import { APP_CONFIG } from "@/constants";

export const apiConfig = {
  baseURL: APP_CONFIG.API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
};

export const wsConfig = {
  url: APP_CONFIG.WS_URL,
  reconnectDelay: 3000,
  maxReconnectAttempts: 10,
};
```

**Step 2**: `src/api/client.js` 개선

```javascript
import axios from "axios";
import { apiConfig } from "./config";

const client = axios.create(apiConfig);

// 요청 인터셉터는 setupAxios.js에서 전역으로 설정됨
// 이 인스턴스는 필요 시 독립적으로 사용 가능

export default client;
```

**커밋 포인트**: `git commit -m "refactor: API 클라이언트 구조 개선"`

---

## Phase 2: 구조 개선 (1-2주) 🏛️

### 목표

컴포넌트와 훅의 책임을 명확히 하고 재사용성 향상

---

### 2.1 공통 컴포넌트 추출 (우선순위: 🔥 높음)

#### 작업 순서

**Step 1**: `src/components/common/` 폴더 생성

```bash
mkdir -p src/components/common
```

**Step 2**: `src/components/common/LoadingSpinner.jsx` 생성

```javascript
import React from "react";

/**
 * 로딩 스피너 컴포넌트
 * @param {Object} props
 * @param {string} props.size - 크기 (sm, md, lg)
 * @param {string} props.className - 추가 CSS 클래스
 */
export default function LoadingSpinner({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`${sizeClasses[size]} border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin`}
      />
    </div>
  );
}
```

**Step 3**: `src/components/common/ErrorMessage.jsx` 생성

```javascript
import React from "react";
import { IoWarning } from "react-icons/io5";

/**
 * 에러 메시지 컴포넌트
 */
export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null;

  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
      <div className="flex items-center">
        <IoWarning className="text-red-500 text-xl mr-3" />
        <div className="flex-1">
          <p className="text-red-700">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-4 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            재시도
          </button>
        )}
      </div>
    </div>
  );
}
```

**Step 4**: `src/components/common/EmptyState.jsx` 생성

```javascript
import React from "react";

/**
 * 빈 상태 컴포넌트
 */
export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {Icon && <Icon className="text-gray-400 text-6xl mb-4" />}
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 text-center mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
```

**Step 5**: `src/components/common/StatusBadge.jsx` 생성

```javascript
import React from "react";
import { getStatusBadgeClass } from "@/utils/status";

/**
 * 상태 배지 컴포넌트
 */
export default function StatusBadge({ status, text }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
        status
      )}`}
    >
      {text || status}
    </span>
  );
}
```

**Step 6**: `src/components/common/index.js` 생성

```javascript
export { default as LoadingSpinner } from "./LoadingSpinner";
export { default as ErrorMessage } from "./ErrorMessage";
export { default as EmptyState } from "./EmptyState";
export { default as StatusBadge } from "./StatusBadge";
```

**커밋 포인트**: `git commit -m "feat: 공통 컴포넌트 추출 완료"`

---

### 2.2 Custom Hook 개선 (우선순위: 🟡 중간)

#### 작업 순서

**Step 1**: `src/hooks/useAsync.js` 생성 (공통 패턴 추출)

```javascript
import { useState, useCallback } from "react";

/**
 * 비동기 작업을 처리하는 공통 훅
 * @param {Function} asyncFunction - 비동기 함수
 * @param {boolean} immediate - 즉시 실행 여부
 */
export function useAsync(asyncFunction, immediate = true) {
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);

      try {
        const result = await asyncFunction(...args);
        setData(result);
        return result;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction]
  );

  return { loading, error, data, execute };
}
```

**Step 2**: 기존 훅에 적용 (예: `useDriverAPI.js`)

```javascript
import { useAsync } from "./useAsync";
import client from "../api/client";

export function useDriverAPI() {
  const fetchDrivers = async () => {
    const response = await client.get("/api/admin/drivers");
    return response.data.data || response.data;
  };

  const {
    loading,
    error,
    data: drivers,
    execute: refetch,
  } = useAsync(fetchDrivers);

  return { loading, error, drivers, refetch };
}
```

**커밋 포인트**: `git commit -m "refactor: Custom Hook 패턴 개선"`

---

### 2.3 폴더 구조 최적화 (우선순위: 🟢 낮음)

#### 제안하는 구조

```
src/
├── api/              # API 관련
│   ├── config.js
│   ├── client.js
│   ├── endpoints/    # API 엔드포인트별 분리
│   │   ├── auth.js
│   │   ├── drivers.js
│   │   └── dispatches.js
│   └── interceptors/ # 인터셉터 분리
│       ├── request.js
│       └── response.js
│
├── components/
│   ├── common/       # 공통 컴포넌트
│   ├── features/     # 기능별 컴포넌트
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── drivers/
│   │   └── realtime/
│   └── layouts/      # 레이아웃
│
├── constants/        # 상수
├── hooks/            # Custom Hooks
├── pages/            # 페이지 컴포넌트
├── utils/            # 유틸리티
├── contexts/         # Context Providers (선택)
└── types/            # TypeScript 타입 (향후)
```

**주의**: 한 번에 전체 구조를 바꾸지 말고, 새 파일은 새 구조로, 기존 파일은 점진적으로 이동

**커밋 포인트**: 각 이동마다 개별 커밋

---

## Phase 3: 품질 향상 (1-2주) ✨

### 목표

테스트 추가 및 타입 안전성 확보

---

### 3.1 테스트 코드 작성 (우선순위: 🔥 높음)

#### 작업 순서

**Step 1**: 테스트 환경 확인

```bash
# react-scripts에 jest가 포함되어 있음
npm test -- --version
```

**Step 2**: 유틸리티 함수 테스트부터 시작

```javascript
// src/utils/__tests__/status.test.js
import { normalizeDispatchStatus, getStatusBadgeClass } from "../status";

describe("normalizeDispatchStatus", () => {
  it("should normalize SCHEDULED status", () => {
    expect(normalizeDispatchStatus("SCHEDULED")).toBe("SCHEDULED");
    expect(normalizeDispatchStatus("PLANNED")).toBe("SCHEDULED");
    expect(normalizeDispatchStatus("scheduled")).toBe("SCHEDULED");
  });

  it("should normalize RUNNING status", () => {
    expect(normalizeDispatchStatus("RUNNING")).toBe("RUNNING");
    expect(normalizeDispatchStatus("IN_PROGRESS")).toBe("RUNNING");
  });

  it("should return default for invalid status", () => {
    expect(normalizeDispatchStatus(null)).toBe("SCHEDULED");
    expect(normalizeDispatchStatus("")).toBe("SCHEDULED");
    expect(normalizeDispatchStatus("INVALID")).toBe("SCHEDULED");
  });
});

describe("getStatusBadgeClass", () => {
  it("should return correct class for each status", () => {
    expect(getStatusBadgeClass("SCHEDULED")).toContain("bg-blue-100");
    expect(getStatusBadgeClass("RUNNING")).toContain("bg-green-100");
    expect(getStatusBadgeClass("COMPLETED")).toContain("bg-gray-100");
  });
});
```

**Step 3**: 컴포넌트 테스트

```javascript
// src/components/common/__tests__/LoadingSpinner.test.jsx
import { render, screen } from "@testing-library/react";
import LoadingSpinner from "../LoadingSpinner";

describe("LoadingSpinner", () => {
  it("should render spinner", () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole("progressbar", { hidden: true });
    expect(spinner).toBeInTheDocument();
  });

  it("should apply size classes", () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    expect(container.firstChild.firstChild).toHaveClass("w-12", "h-12");
  });
});
```

**Step 4**: Hook 테스트

```javascript
// src/hooks/__tests__/useAsync.test.js
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAsync } from "../useAsync";

describe("useAsync", () => {
  it("should handle successful async call", async () => {
    const asyncFn = jest.fn().mockResolvedValue("success");
    const { result } = renderHook(() => useAsync(asyncFn, false));

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe(null);

    act(() => {
      result.current.execute();
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBe("success");
    });
  });

  it("should handle errors", async () => {
    const error = new Error("test error");
    const asyncFn = jest.fn().mockRejectedValue(error);
    const { result } = renderHook(() => useAsync(asyncFn, false));

    await act(async () => {
      try {
        await result.current.execute();
      } catch (e) {
        // Expected
      }
    });

    await waitFor(() => {
      expect(result.current.error).toBe(error);
    });
  });
});
```

**Step 5**: 테스트 커버리지 확인

```bash
npm test -- --coverage --watchAll=false
```

**목표**: 핵심 로직 70% 이상 커버리지

**커밋 포인트**: `git commit -m "test: 유틸리티 및 컴포넌트 테스트 추가"`

---

### 3.2 PropTypes 추가 (우선순위: 🟡 중간)

#### 작업 순서

**Step 1**: PropTypes 패키지 설치 (이미 포함되어 있음)

```bash
# 확인
npm list prop-types
```

**Step 2**: 컴포넌트에 PropTypes 추가

```javascript
// src/components/common/StatusBadge.jsx
import React from "react";
import PropTypes from "prop-types";
import { getStatusBadgeClass } from "@/utils/status";

function StatusBadge({ status, text }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
        status
      )}`}
    >
      {text || status}
    </span>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  text: PropTypes.string,
};

export default StatusBadge;
```

**Step 3**: 복잡한 객체에 대한 PropTypes

```javascript
// src/components/Driver/DriverCard.jsx
import PropTypes from "prop-types";

DriverCard.propTypes = {
  driver: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    licenseNumber: PropTypes.string,
    phone: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};
```

**커밋 포인트**: `git commit -m "feat: PropTypes 추가로 타입 안전성 향상"`

---

### 3.3 에러 바운더리 추가 (우선순위: 🟡 중간)

#### 작업 순서

**Step 1**: `src/components/common/ErrorBoundary.jsx` 생성

```javascript
import React from "react";
import { IoWarning, IoRefresh } from "react-icons/io5";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });

    // 에러 로깅 서비스로 전송 (선택)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
            <div className="flex items-center justify-center mb-4">
              <IoWarning className="text-red-500 text-6xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
              문제가 발생했습니다
            </h1>
            <p className="text-gray-600 text-center mb-6">
              일시적인 오류가 발생했습니다. 페이지를 새로고침하거나 잠시 후 다시
              시도해주세요.
            </p>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mb-4 p-4 bg-gray-100 rounded text-sm">
                <p className="font-mono text-red-600">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center"
              >
                <IoRefresh className="mr-2" />
                다시 시도
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                홈으로
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

**Step 2**: App.jsx에 적용

```javascript
// src/App.jsx
import ErrorBoundary from "./components/common/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <TokenProvider>{/* 기존 코드 */}</TokenProvider>
    </ErrorBoundary>
  );
}
```

**커밋 포인트**: `git commit -m "feat: 에러 바운더리 추가"`

---

## Phase 4: 최적화 (1주) ⚡

### 목표

성능 최적화 및 사용자 경험 개선

---

### 4.1 Code Splitting 적용 (우선순위: 🟡 중간)

#### 작업 순서

**Step 1**: React.lazy로 페이지 분리

```javascript
// src/App.jsx
import React, { Suspense, lazy } from "react";
import LoadingSpinner from "./components/common/LoadingSpinner";

// Lazy load pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Drivers = lazy(() => import("./pages/Drivers"));
const Buses = lazy(() => import("./pages/Buses"));
const OperatingSchedule = lazy(() => import("./pages/OperatingSchedule"));
const RealtimeOperation = lazy(() => import("./pages/RealtimeOperation"));
const Insight = lazy(() => import("./pages/Insight"));
const MyPage = lazy(() => import("./pages/MyPage"));

// Loading fallback
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <LoadingSpinner size="lg" />
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <TokenProvider>
        <WebSocketProvider>
          <NotificationProvider>
            <ToastProvider>
              <Router>
                <Suspense fallback={<PageLoader />}>
                  <Routes>{/* 라우트 설정 */}</Routes>
                </Suspense>
              </Router>
            </ToastProvider>
          </NotificationProvider>
        </WebSocketProvider>
      </TokenProvider>
    </ErrorBoundary>
  );
}
```

**커밋 포인트**: `git commit -m "perf: Code Splitting으로 초기 로딩 최적화"`

---

### 4.2 메모이제이션 적용 (우선순위: 🟢 낮음)

#### 작업 순서

**Step 1**: 비용이 높은 계산에 useMemo 적용

```javascript
// src/pages/Dashboard.jsx
import { useMemo } from "react";

function Dashboard() {
  const { dispatches } = useDashboardData();

  // 비용이 높은 계산을 메모이제이션
  const statistics = useMemo(() => {
    return {
      total: dispatches.length,
      scheduled: dispatches.filter((d) => d.status === "SCHEDULED").length,
      running: dispatches.filter((d) => d.status === "RUNNING").length,
      completed: dispatches.filter((d) => d.status === "COMPLETED").length,
    };
  }, [dispatches]);

  // ...
}
```

**Step 2**: 콜백 함수 메모이제이션

```javascript
// src/components/Driver/DriverCard.jsx
import { useCallback } from "react";

function DriverCard({ driver, onEdit, onDelete }) {
  const handleEdit = useCallback(() => {
    onEdit(driver.id);
  }, [driver.id, onEdit]);

  const handleDelete = useCallback(() => {
    onDelete(driver.id);
  }, [driver.id, onDelete]);

  // ...
}
```

**주의**: 과도한 메모이제이션은 오히려 성능을 해칠 수 있습니다. 프로파일링 후 필요한 곳에만 적용하세요.

**커밋 포인트**: `git commit -m "perf: 메모이제이션으로 재렌더링 최적화"`

---

### 4.3 이미지 및 에셋 최적화 (우선순위: 🟢 낮음)

#### 작업 순서

**Step 1**: 이미지 최적화

```bash
# WebP 형식 사용 권장
# 이미지 압축 도구 사용
```

**Step 2**: SVG 아이콘 최적화

```bash
# React Icons 사용 중이므로 tree-shaking 자동 적용됨
# 사용하지 않는 아이콘 import 제거
```

**커밋 포인트**: `git commit -m "perf: 에셋 최적화"`

---

## Phase 5: 유지보수성 강화 (지속) 🔧

### 목표

장기적인 코드 품질 유지

---

### 5.1 문서화 강화 (우선순위: 🟡 중간)

#### 작업 순서

**Step 1**: JSDoc 주석 추가

````javascript
/**
 * 실시간 배차 운행 데이터를 구독하고 관리하는 커스텀 훅
 *
 * @param {number} dispatchId - 배차 ID
 * @returns {{
 *   loading: boolean - 로딩 상태
 *   error: Error | null - 에러 객체
 *   meta: Object | null - 배차 메타데이터
 *   latestLocation: Object | null - 최신 위치 데이터
 *   latestObd: Object | null - 최신 OBD 데이터
 *   kpis: Object - KPI 데이터 (속도, RPM, SOC 등)
 *   stale: { location: boolean, obd: boolean } - 데이터 신선도
 * }}
 *
 * @example
 * ```jsx
 * function RealtimeOperation() {
 *   const { latestLocation, kpis, stale } = useLiveDispatch(123);
 *
 *   if (stale.location) {
 *     return <div>위치 데이터가 오래되었습니다</div>;
 *   }
 *
 *   return <div>현재 속도: {kpis.speed} km/h</div>;
 * }
 * ```
 */
export function useLiveDispatch(dispatchId) {
  // ...
}
````

**Step 2**: README 업데이트

- 설치 방법
- 환경 변수 설정
- 개발 가이드
- 배포 방법

**커밋 포인트**: `git commit -m "docs: JSDoc 및 README 업데이트"`

---

### 5.2 CI/CD 설정 (우선순위: 🟢 낮음)

#### 작업 순서

**Step 1**: `.github/workflows/ci.yml` 생성

```yaml
name: CI

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

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint --if-present

      - name: Run tests
        run: npm test -- --coverage --watchAll=false

      - name: Build
        run: npm run build

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        if: always()
```

**커밋 포인트**: `git commit -m "ci: GitHub Actions 워크플로우 추가"`

---

## 📊 진행 상황 체크리스트

### Phase 0: 준비 ✅

- [ ] Git 브랜치 전략 수립
- [ ] 개발 환경 설정 (ESLint, Prettier)
- [ ] 작업 체크리스트 생성

### Phase 1: 기초 다지기

- [ ] 상수 파일 분리
- [ ] 유틸리티 함수 정리
- [ ] 환경 변수 관리 개선
- [ ] API 키 재발급 ⚠️
- [ ] API 클라이언트 개선

### Phase 2: 구조 개선

- [ ] 공통 컴포넌트 추출
- [ ] Custom Hook 개선
- [ ] 폴더 구조 최적화

### Phase 3: 품질 향상

- [ ] 테스트 코드 작성 (목표: 70% 커버리지)
- [ ] PropTypes 추가
- [ ] 에러 바운더리 추가

### Phase 4: 최적화

- [ ] Code Splitting 적용
- [ ] 메모이제이션 적용
- [ ] 에셋 최적화

### Phase 5: 유지보수성 강화

- [ ] JSDoc 문서화
- [ ] README 업데이트
- [ ] CI/CD 설정

---

## 🚫 자주 하는 실수와 해결책

### 실수 1: 너무 많은 것을 한 번에 변경

**증상**: 커밋이 커지고, 무엇을 변경했는지 모르게 됨

**해결책**:

- 하나의 PR은 하나의 목적만
- 커밋은 최대한 작게
- 각 변경사항을 독립적으로 테스트

### 실수 2: 테스트 없이 리팩토링

**증상**: 리팩토링 후 기능이 깨짐

**해결책**:

- 리팩토링 전에 테스트 작성
- 리팩토링 중에는 기능 변경 금지
- 각 단계마다 테스트 실행

### 실수 3: 모든 것을 완벽하게 하려는 욕심

**증상**: 진행이 느리고, 완성되지 않음

**해결책**:

- "완벽"보다 "개선"에 집중
- 80/20 법칙 적용 (20% 노력으로 80% 개선)
- 점진적 개선 (Iterative Improvement)

---

## 💡 유용한 팁

### 1. 커밋 메시지 컨벤션

```
feat: 새로운 기능 추가
fix: 버그 수정
refactor: 코드 리팩토링
test: 테스트 추가/수정
docs: 문서 수정
style: 코드 포맷팅 (기능 변경 없음)
chore: 빌드/설정 변경
perf: 성능 개선
```

### 2. 코드 리뷰 자가 체크리스트

- [ ] 코드가 하나의 목적만 수행하는가?
- [ ] 변수/함수 이름이 명확한가?
- [ ] 중복 코드가 없는가?
- [ ] 에러 처리가 적절한가?
- [ ] 테스트가 통과하는가?
- [ ] 문서화가 충분한가?

### 3. 리팩토링 전후 비교

항상 Before/After를 명확히 하여 개선 사항을 문서화하세요.

```javascript
// ❌ Before
if (status === "SCHEDULED" || status === "PLANNED") {
  // ...
}

// ✅ After
import { normalizeDispatchStatus } from "@/utils/status";
const normalized = normalizeDispatchStatus(status);
if (normalized === "SCHEDULED") {
  // ...
}
```

---

## 📚 참고 자료

### 공식 문서

- [React 공식 문서](https://react.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Tailwind CSS](https://tailwindcss.com/)

### 아티클

- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)
- [React Design Patterns](https://www.patterns.dev/posts/react-patterns)

### 도구

- [Bundle Analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)
- [React DevTools](https://react.dev/learn/react-developer-tools)

---

## 🤝 도움이 필요할 때

1. **막혔을 때**: 현재 브랜치를 커밋하고, 새 브랜치에서 다른 방법 시도
2. **확신이 없을 때**: 작은 POC(Proof of Concept)로 먼저 테스트
3. **의견이 필요할 때**: 코드 리뷰 요청 또는 팀원과 상의

---

## ✅ 다음 단계

1. **Phase 0 완료**: 개발 환경 설정
2. **Phase 1 시작**: 상수 파일 분리부터
3. **작은 승리**: 하나씩 완료하며 성취감 느끼기
4. **지속적 개선**: 완벽보다는 꾸준함이 중요

**지금 시작하세요!** 🚀

```bash
# 첫 걸음
git checkout -b refactor/phase1-constants
mkdir src/constants
touch src/constants/api.js
```

**마지막 업데이트**: 2026년 1월 8일
