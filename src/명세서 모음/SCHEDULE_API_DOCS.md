# 스케줄 관리 API 문서

## 개요
운행 스케줄(배차) 관리 시스템의 CRUD 작업을 위한 API 엔드포인트입니다.
DB의 `dispatch` 테이블을 기반으로 합니다.

## 인증
모든 API 요청에는 JWT 토큰이 필요합니다.
```
Authorization: Bearer <jwt_token>
```

## API 엔드포인트

### 1. 스케줄 목록 조회
```
GET /api/dispatch
```

**응답 예시:**
```json
{
  "message": "스케줄 목록을 성공적으로 조회했습니다.",
  "data": [
    {
      "dispatchId": 1,
      "driverId": 1,
      "busId": 1,
      "status": "SCHEDULED",
      "dispatchDate": "2024-08-24",
      "scheduledDeparture": "08:00:00",
      "actualDeparture": null,
      "actualArrival": null,
      "warningCount": 0,
      "drivingScore": null
    }
  ]
}
```

### 2. 스케줄 상세 조회
```
GET /api/dispatch/{dispatchId}
```

**응답 예시:**
```json
{
  "message": "스케줄 정보를 성공적으로 조회했습니다.",
  "data": {
    "dispatchId": 1,
    "driverId": 1,
    "busId": 1,
    "status": "COMPLETED",
    "dispatchDate": "2024-08-24",
    "scheduledDeparture": "08:00:00",
    "actualDeparture": "08:05:00",
    "actualArrival": "17:30:00",
    "warningCount": 2,
    "drivingScore": 85
  }
}
```

### 3. 스케줄 추가
```
POST /api/dispatch
```

**요청 본문:**
```json
{
  "driverId": 1,
  "busId": 1,
  "dispatchDate": "2024-08-25",
  "scheduledDeparture": "09:00:00"
}
```

**응답 예시:**
```json
{
  "message": "스케줄이 성공적으로 추가되었습니다.",
  "data": {
    "dispatchId": 2,
    "driverId": 1,
    "busId": 1,
    "status": "SCHEDULED",
    "dispatchDate": "2024-08-25",
    "scheduledDeparture": "09:00:00",
    "actualDeparture": null,
    "actualArrival": null,
    "warningCount": 0,
    "drivingScore": null
  }
}
```

### 4. 스케줄 수정
```
PUT /api/dispatch/{dispatchId}
```

**요청 본문:**
```json
{
  "driverId": 1,
  "busId": 1,
  "status": "RUNNING",
  "dispatchDate": "2024-08-25",
  "scheduledDeparture": "09:00:00",
  "actualDeparture": "09:05:00"
}
```

**응답 예시:**
```json
{
  "message": "스케줄이 성공적으로 수정되었습니다.",
  "data": {
    "dispatchId": 2,
    "driverId": 1,
    "busId": 1,
    "status": "RUNNING",
    "dispatchDate": "2024-08-25",
    "scheduledDeparture": "09:00:00",
    "actualDeparture": "09:05:00",
    "actualArrival": null,
    "warningCount": 0,
    "drivingScore": null
  }
}
```

### 5. 스케줄 삭제
```
DELETE /api/dispatch/{dispatchId}
```

**응답 예시:**
```json
{
  "message": "스케줄이 성공적으로 삭제되었습니다."
}
```

### 6. 운행 시작
```
POST /api/dispatch/{dispatchId}/start
```

**요청 본문:**
```json
{
  "actualDeparture": "09:05:00"
}
```

**응답 예시:**
```json
{
  "message": "운행이 성공적으로 시작되었습니다.",
  "data": {
    "dispatchId": 2,
    "status": "RUNNING",
    "actualDeparture": "09:05:00"
  }
}
```

### 7. 운행 종료
```
POST /api/dispatch/{dispatchId}/complete
```

**요청 본문:**
```json
{
  "actualArrival": "17:30:00",
  "drivingScore": 85,
  "warningCount": 2
}
```

**응답 예시:**
```json
{
  "message": "운행이 성공적으로 완료되었습니다.",
  "data": {
    "dispatchId": 2,
    "status": "COMPLETED",
    "actualArrival": "17:30:00",
    "drivingScore": 85,
    "warningCount": 2
  }
}
```

### 8. 특정 날짜 스케줄 조회
```
GET /api/dispatch/date/{date}
```

**예시:** `/api/dispatch/date/2024-08-24`

**응답 예시:**
```json
{
  "message": "해당 날짜의 스케줄을 성공적으로 조회했습니다.",
  "data": [
    {
      "dispatchId": 1,
      "driverId": 1,
      "busId": 1,
      "status": "COMPLETED",
      "dispatchDate": "2024-08-24",
      "scheduledDeparture": "08:00:00",
      "actualDeparture": "08:05:00",
      "actualArrival": "17:30:00",
      "warningCount": 2,
      "drivingScore": 85
    }
  ]
}
```

### 9. 특정 운전자 스케줄 조회
```
GET /api/dispatch/driver/{driverId}
```

**응답 예시:**
```json
{
  "message": "해당 운전자의 스케줄을 성공적으로 조회했습니다.",
  "data": [
    {
      "dispatchId": 1,
      "driverId": 1,
      "busId": 1,
      "status": "COMPLETED",
      "dispatchDate": "2024-08-24",
      "scheduledDeparture": "08:00:00",
      "actualDeparture": "08:05:00",
      "actualArrival": "17:30:00",
      "warningCount": 2,
      "drivingScore": 85
    }
  ]
}
```

### 10. 특정 버스 스케줄 조회
```
GET /api/dispatch/bus/{busId}
```

**응답 예시:**
```json
{
  "message": "해당 버스의 스케줄을 성공적으로 조회했습니다.",
  "data": [
    {
      "dispatchId": 1,
      "driverId": 1,
      "busId": 1,
      "status": "COMPLETED",
      "dispatchDate": "2024-08-24",
      "scheduledDeparture": "08:00:00",
      "actualDeparture": "08:05:00",
      "actualArrival": "17:30:00",
      "warningCount": 2,
      "drivingScore": 85
    }
  ]
}
```

### 11. 스케줄 통계 조회
```
GET /api/dispatch/stats
```

**응답 예시:**
```json
{
  "message": "스케줄 통계를 성공적으로 조회했습니다.",
  "data": {
    "total": 150,
    "today": 12,
    "completedToday": 8,
    "byStatus": {
      "SCHEDULED": 45,
      "RUNNING": 5,
      "COMPLETED": 95,
      "DELAYED": 3,
      "CANCELLED": 2
    },
    "avgDrivingScore": 82.5,
    "totalWarnings": 25
  }
}
```

## 데이터 타입 및 제약사항

### Status (상태)
- `SCHEDULED`: 예정
- `RUNNING`: 운행중  
- `COMPLETED`: 완료
- `DELAYED`: 지연
- `CANCELLED`: 취소

### 필수 필드 (생성 시)
- `driverId`: 운전자 ID (INT, FK → driver.driverId)
- `busId`: 버스 ID (INT, FK → bus.busId)
- `dispatchDate`: 배차일 (DATE)
- `scheduledDeparture`: 예정 출발시간 (TIME)

### 선택 필드
- `actualDeparture`: 실제 출발시간 (TIME)
- `actualArrival`: 실제 도착시간 (TIME)
- `warningCount`: 경고수 (INT, 기본값 0)
- `drivingScore`: 운행점수 (INT, 0-100)
- `status`: 상태 (ENUM, 기본값 'SCHEDULED')

### 시간 형식
- **DATE**: `YYYY-MM-DD` (예: `2024-08-24`)
- **TIME**: `HH:MM:SS` (예: `08:30:00`)

## 비즈니스 규칙

### 1. 스케줄 생성 제약
- 같은 운전자가 같은 날짜에 중복 배차 불가
- 같은 버스가 같은 시간대에 중복 배차 불가
- 배차일은 과거 날짜 불가

### 2. 상태 변경 규칙
```
SCHEDULED → RUNNING (운행 시작)
RUNNING → COMPLETED (운행 완료)
SCHEDULED → DELAYED (지연)
SCHEDULED → CANCELLED (취소)
```

### 3. 데이터 무결성
- `driverId`는 존재하는 운전자여야 함
- `busId`는 존재하는 버스여야 함
- `actualDeparture`는 `scheduledDeparture` 이후여야 함
- `actualArrival`은 `actualDeparture` 이후여야 함

## 에러 응답

### 400 Bad Request
```json
{
  "message": "입력 데이터가 올바르지 않습니다.",
  "details": {
    "driverId": "운전자 ID는 필수입니다.",
    "dispatchDate": "배차일은 미래 날짜여야 합니다."
  }
}
```

### 401 Unauthorized
```json
{
  "message": "인증이 필요합니다."
}
```

### 403 Forbidden
```json
{
  "message": "접근 권한이 없습니다."
}
```

### 404 Not Found
```json
{
  "message": "요청한 스케줄을 찾을 수 없습니다."
}
```

### 409 Conflict
```json
{
  "message": "해당 시간에 이미 배차된 스케줄이 있습니다."
}
```

### 500 Internal Server Error
```json
{
  "message": "서버 내부 오류가 발생했습니다."
}
```

## 사용 예시

### JavaScript (Axios)
```javascript
// 스케줄 목록 조회
const getSchedules = async () => {
  try {
    const response = await axios.get('/api/dispatch', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('스케줄 목록 조회 실패:', error);
  }
};

// 스케줄 추가
const addSchedule = async (scheduleData) => {
  try {
    const response = await axios.post('/api/dispatch', scheduleData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('스케줄 추가 실패:', error);
  }
};

// 운행 시작
const startDrive = async (dispatchId, actualDeparture) => {
  try {
    const response = await axios.post(`/api/dispatch/${dispatchId}/start`, {
      actualDeparture
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('운행 시작 실패:', error);
  }
};
```

## 주의사항

1. **시간대 처리**: 모든 시간은 서버의 로컬 시간대를 기준으로 합니다.
2. **데이터 일관성**: 스케줄 수정 시 관련된 경고(warning) 데이터도 함께 확인해야 합니다.
3. **권한 관리**: 운전자는 자신의 스케줄만 조회 가능, 관리자는 모든 스케줄 관리 가능
4. **실시간 업데이트**: 운행 중인 스케줄의 상태는 실시간으로 업데이트됩니다.
5. **백업 및 복구**: 중요한 운행 데이터이므로 정기적인 백업이 필요합니다.
