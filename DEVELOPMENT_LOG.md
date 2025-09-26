# 개발 로그 - 실시간 시스템 구축

## 프로젝트 개요
React 기반 버스 운영 관리 시스템의 실시간 기능 구현

## 주요 수정 사항

### 1. DriveDetail 페이지 권한 문제 해결 (2025-09-26)

#### 문제점
- DriveDetail 페이지에서 403 권한 에러 발생
- 데이터 필드 매핑 오류로 정보 표시 안됨

#### 해결책
```javascript
// 역할 기반 API 엔드포인트 분기
const userInfo = getUserInfo();
const isAdmin = userInfo?.role === 'admin';

const endpoint = isAdmin 
  ? `/api/admin/dispatches/${id}`
  : `/api/driver/dispatches/${id}`;
```

#### 수정된 파일
- `src/pages/DriveDetail.jsx`: 역할 기반 API 호출 로직 추가
- 필드 매핑 수정: `username`, `vehicleNumber`, `routeNumber`

### 2. NotificationCountProvider 컨텍스트 활성화

#### 문제점
- NotificationCountProvider 컨텍스트가 활성화되지 않음

#### 해결책
```javascript
// App.jsx 컨텍스트 계층 구조 수정
<TokenProvider>
  <ToastProvider>
    <NotificationCountProvider>
      <Router>
        {/* 앱 컴포넌트들 */}
      </Router>
    </NotificationCountProvider>
  </ToastProvider>
</TokenProvider>
```

### 3. 운행 중인 운전자 표시 기능 구현

#### 문제점
- 사이드바에 운행 중인 운전자가 표시되지 않음

#### 해결책
```javascript
// useScheduleAPI.js에 fetchRunningDrivers 함수 추가
const fetchRunningDrivers = async () => {
  try {
    // 백엔드 필터링 우선 시도
    const response = await api.get('/api/admin/dispatches', {
      params: { status: 'RUNNING' }
    });
    
    // 운전자 세부 정보 추가 조회
    const driversWithDetails = await Promise.all(
      response.data.map(async (dispatch) => {
        const driverResponse = await api.get(`/api/admin/drivers/${dispatch.driverId}`);
        return {
          ...dispatch,
          driver: driverResponse.data
        };
      })
    );
    
    return driversWithDetails;
  } catch (error) {
    // 프론트엔드 필터링 fallback
    console.warn('백엔드 필터링 실패, 프론트엔드 필터링으로 전환');
    // ... fallback 로직
  }
};
```

## WebSocket 실시간 시스템 아키텍처 설계

### 하이브리드 접근 방식: API + WebSocket

#### 1. 초기 데이터 로딩 (API)
```javascript
// 안정적인 초기 데이터 로드
const initialData = await api.get('/api/admin/drivers/running');
```

#### 2. 실시간 업데이트 (WebSocket)
```javascript
// 실시간 변경사항 수신
websocket.on('driver-status-changed', (data) => {
  updateRunningDrivers(data);
});

websocket.on('location-updated', (data) => {
  updateDriverLocation(data);
});
```

### 설계 원칙

1. **안정성 우선**: 초기 데이터는 HTTP API로 안정적 로드
2. **실시간성 보장**: 상태 변경은 WebSocket으로 즉시 반영
3. **장애 복구**: WebSocket 연결 끊김 시 API 폴백
4. **성능 최적화**: 불필요한 API 호출 최소화

### 구현 예시: RunningDriversManager
```javascript
class RunningDriversManager {
  constructor() {
    this.drivers = [];
    this.websocket = null;
  }

  async initialize() {
    // 1. 초기 데이터 로드 (API)
    this.drivers = await this.loadInitialData();
    
    // 2. WebSocket 연결
    this.websocket = new WebSocket('/ws/drivers');
    this.setupWebSocketHandlers();
  }

  async loadInitialData() {
    const response = await api.get('/api/admin/drivers/running');
    return response.data;
  }

  setupWebSocketHandlers() {
    this.websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch(data.type) {
        case 'DRIVER_STATUS_CHANGED':
          this.handleStatusChange(data);
          break;
        case 'LOCATION_UPDATED':
          this.handleLocationUpdate(data);
          break;
      }
    };
  }
}
```

## 결론

완전한 실시간 시스템은 **API의 안정성**과 **WebSocket의 실시간성**을 조합한 하이브리드 방식이 최적입니다.

- ✅ DriveDetail 권한 문제 해결
- ✅ 데이터 표시 오류 수정
- ✅ NotificationCountProvider 활성화
- ✅ 운행 중인 운전자 표시 구현
- 🔄 WebSocket 실시간 시스템 설계 완료 (구현 대기)

## 다음 단계

1. WebSocketProvider 활성화
2. 실시간 운전자 추적 시스템 구현
3. 백엔드 WebSocket 엔드포인트 개발
4. 실시간 알림 시스템 통합

---
*최종 업데이트: 2025년 9월 26일*