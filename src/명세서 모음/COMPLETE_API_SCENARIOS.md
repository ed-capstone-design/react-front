# 운전의 진수 시스템 완전 API 시나리오 명세서

## 개요
본 문서는 운전의 진수 시스템에서 사용되는 모든 API 시나리오와 사용자 플로우를 정리한 완전한 명세서입니다.

## 목차
1. [운전자 관리 시나리오](#1-운전자-관리-시나리오)
2. [알림 시스템 시나리오](#2-알림-시스템-시나리오)
3. [운전자 메시지 전송 시나리오](#3-운전자-메시지-전송-시나리오)
4. [실시간 위치 추적 시나리오](#4-실시간-위치-추적-시나리오)
5. [통합 시나리오](#5-통합-시나리오)

---

## 1. 운전자 관리 시나리오

### 1.1 운전자 목록 조회 및 상태별 필터링

**시나리오**: 관리자가 운전자 목록을 상태별로 확인

**API 흐름**:
```
1. GET /api/drivers
   → 모든 운전자 정보 조회
   
2. 프론트엔드에서 상태별 필터링:
   - 운행중: status === "운행중"
   - 대기: status === "대기"  
   - 휴식: status === "휴식"
```

**응답 구조**:
```json
[
  {
    "driverId": 1,
    "driverName": "김철수",
    "phoneNumber": "010-1234-5678",
    "licenseType": "1종 대형",
    "licenseNumber": "12-34-567890",
    "operatorId": 1,
    "careerYears": 5,
    "avgDrivingScore": 85,
    "grade": "A",
    "status": "운행중",
    "createdAt": "2024-01-15T09:00:00Z"
  }
]
```

### 1.2 운전자 정보 수정

**시나리오**: 관리자가 운전자 정보를 수정

**API 흐름**:
```
1. PUT /api/drivers/{driverId}
   → 운전자 정보 업데이트
```

**요청 구조**:
```json
{
  "driverId": 1,
  "driverName": "김철수",
  "phoneNumber": "010-1234-5678",
  "licenseType": "1종 대형",
  "licenseNumber": "12-34-567890",
  "operatorId": 1,
  "careerYears": 6,
  "avgDrivingScore": 87,
  "grade": "A",
  "status": "대기"
}
```

### 1.3 운전자 삭제

**시나리오**: 관리자가 운전자를 시스템에서 제거

**API 흐름**:
```
1. DELETE /api/drivers/{driverId}
   → 운전자 삭제
```

### 1.4 운전자 추가

**시나리오**: 새로운 운전자를 시스템에 등록

**API 흐름**:
```
1. POST /api/drivers
   → 새 운전자 등록
```

**요청 구조**:
```json
{
  "driverName": "박영희",
  "phoneNumber": "010-2345-6789",
  "licenseType": "1종 대형",
  "operatorId": 1
}
```

---

## 2. 알림 시스템 시나리오

### 2.1 알림 목록 조회

**시나리오**: 관리자가 모든 알림을 확인

**API 흐름**:
```
1. GET /api/notifications
   → 모든 알림 목록 조회
```

**응답 구조**:
```json
[
  {
    "id": "warning_123",
    "title": "과속 경고",
    "message": "SPEEDING 경고가 발생했습니다.",
    "timestamp": "2024-01-15T10:30:00Z",
    "read": false,
    "type": "warning",
    "priority": "high",
    "dispatchId": 12345,
    "action": "view_warning"
  }
]
```

### 2.2 알림 타입별 분류

**경고 알림**:
- `type: "warning"`, `priority: "high"`
- 과속, 졸음운전, 급제동 등

**완료 알림**:
- `type: "success"`, `priority: "normal"`
- 운행 완료, 메모 전송 완료 등

**시스템 알림**:
- `type: "info"`, `priority: "normal"`
- 시스템 상태, 일반 공지 등

**긴급 알림**:
- `type: "error"`, `priority: "urgent"`
- 시스템 오류, 응급 상황 등

### 2.3 알림 읽음 처리

**시나리오**: 관리자가 알림을 확인

**API 흐름**:
```
1. PUT /api/notifications/{id}/read
   → 특정 알림 읽음 처리

2. PUT /api/notifications/read-all
   → 모든 알림 읽음 처리
```

### 2.4 알림 삭제

**시나리오**: 불필요한 알림 제거

**API 흐름**:
```
1. DELETE /api/notifications/{id}
   → 특정 알림 삭제
```

### 2.5 새 알림 생성

**시나리오**: 시스템이 자동으로 알림 생성

**API 흐름**:
```
1. POST /api/notifications
   → 새 알림 추가
```

**요청 구조**:
```json
{
  "title": "메모 전송 완료",
  "message": "김철수 운전자에게 메모가 전송되었습니다.",
  "type": "success",
  "priority": "normal",
  "driverId": 1,
  "action": "view_driver_messages"
}
```

---

## 3. 운전자 메시지 전송 시나리오

### 3.1 운전자에게 메모 전송

**시나리오**: 관리자가 운전자 패널에서 운전자를 클릭하여 메모 전송

**사용자 플로우**:
```
1. DriverListPanel에서 운전자 카드 클릭
2. UserDetailModal 열림
3. 메모 작성 후 "메모 보내기" 클릭
4. API 호출 및 알림 생성
```

**API 흐름**:
```
1. POST /api/drivers/{driverId}/messages
   → 운전자에게 메시지 전송

2. POST /api/notifications  
   → 메시지 전송 완료 알림 생성
```

**메시지 전송 요청 구조**:
```json
{
  "message": "안전운전 부탁드립니다.",
  "type": "memo",
  "priority": "normal",
  "senderId": 1,
  "senderName": "관리자",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**메시지 전송 응답 구조**:
```json
{
  "messageId": 12345,
  "driverId": 1,
  "message": "안전운전 부탁드립니다.",
  "type": "memo",
  "priority": "normal",
  "senderId": 1,
  "senderName": "관리자",
  "timestamp": "2024-01-15T10:30:00Z",
  "status": "sent",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### 3.2 운전자 메시지 이력 조회

**시나리오**: 특정 운전자에게 보낸 메시지 이력 확인

**API 흐름**:
```
1. GET /api/drivers/{driverId}/messages
   → 해당 운전자의 메시지 이력 조회
```

**응답 구조**:
```json
[
  {
    "messageId": 12345,
    "message": "안전운전 부탁드립니다.",
    "type": "memo",
    "priority": "normal",
    "senderId": 1,
    "senderName": "관리자",
    "timestamp": "2024-01-15T10:30:00Z",
    "status": "read",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

---

## 4. 실시간 위치 추적 시나리오

### 4.1 버스 위치 정보 조회

**시나리오**: Insight 페이지에서 실시간 버스 위치 확인

**API 흐름**:
```
1. GET /api/buses/locations
   → 모든 버스의 실시간 위치 정보 조회
```

**응답 구조**:
```json
[
  {
    "busId": 101,
    "driverId": 1,
    "driverName": "김철수",
    "plateNumber": "서울 12가 3456",
    "location": {
      "latitude": 37.2982,
      "longitude": 127.0456,
      "timestamp": "2024-01-15T10:30:00Z"
    },
    "status": "운행중",
    "currentDispatchId": 12345,
    "route": "노선A",
    "speed": 45
  }
]
```

### 4.2 특정 운전자 위치 추적

**시나리오**: 운전자 상세 정보에서 현재 위치 확인

**API 흐름**:
```
1. GET /api/drivers/{driverId}/location
   → 특정 운전자의 현재 위치 조회
```

**응답 구조**:
```json
{
  "driverId": 1,
  "driverName": "김철수",
  "location": {
    "latitude": 37.2982,
    "longitude": 127.0456,
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "busInfo": {
    "busId": 101,
    "plateNumber": "서울 12가 3456",
    "status": "운행중"
  }
}
```

---

## 5. 통합 시나리오

### 5.1 운전자 관리 → 메시지 전송 → 알림 생성 통합 플로우

**완전한 사용자 시나리오**:

```
1. 관리자가 DriverListPanel에서 운전자 목록 확인
   └─ GET /api/drivers

2. 특정 운전자(김철수) 카드 클릭
   └─ UserDetailModal 열림

3. 현재 위치 확인
   └─ GET /api/drivers/1/location

4. 메모 작성: "안전운전 부탁드립니다"

5. 메모 전송 버튼 클릭
   └─ POST /api/drivers/1/messages
   └─ 메시지 전송 성공

6. 자동으로 알림 생성
   └─ POST /api/notifications
   └─ "김철수에게 메모가 전송되었습니다" 알림 추가

7. 알림 패널에서 확인
   └─ GET /api/notifications
   └─ 새 알림이 목록에 표시
```

### 5.2 경고 발생 → 알림 생성 통합 플로우

**자동 알림 생성 시나리오**:

```
1. 시스템에서 경고 감지
   └─ POST /api/warnings (백엔드에서 생성)

2. NotificationContext에서 자동으로 알림 생성
   └─ generateNotificationsFromData() 실행
   └─ Warning 데이터를 알림으로 변환

3. 관리자 알림 패널에 표시
   └─ 타입: "warning", 우선순위: "high"
   └─ 제목: "과속 경고", 메시지: "SPEEDING 경고가 발생했습니다"
```

### 5.3 상태 변경 통합 플로우

**운전자 상태 변경 시나리오**:

```
1. 운전자 상태 변경 (대기 → 운행중)
   └─ PUT /api/drivers/1
   └─ status: "운행중" 업데이트

2. DriverContext에서 상태 동기화
   └─ drivers 배열 업데이트

3. DriverListPanel에서 자동 재필터링
   └─ 운행중 = drivers.filter(d => d.status === "운행중")
   └─ 대기 = drivers.filter(d => d.status === "대기")
   └─ 휴식 = drivers.filter(d => d.status === "휴식")

4. UI에서 실시간 상태 반영
   └─ 운전자가 "대기" 섹션에서 "운행중" 섹션으로 이동
```

---

## API 엔드포인트 요약

### 운전자 관리
- `GET /api/drivers` - 운전자 목록 조회
- `POST /api/drivers` - 운전자 추가
- `PUT /api/drivers/{id}` - 운전자 수정
- `DELETE /api/drivers/{id}` - 운전자 삭제
- `GET /api/drivers/{id}/location` - 운전자 위치 조회

### 메시지 관리
- `POST /api/drivers/{id}/messages` - 메시지 전송
- `GET /api/drivers/{id}/messages` - 메시지 이력 조회

### 알림 관리
- `GET /api/notifications` - 알림 목록 조회
- `POST /api/notifications` - 알림 생성
- `PUT /api/notifications/{id}/read` - 알림 읽음 처리
- `PUT /api/notifications/read-all` - 모든 알림 읽음 처리
- `DELETE /api/notifications/{id}` - 알림 삭제

### 위치 추적
- `GET /api/buses/locations` - 모든 버스 위치 조회
- `GET /api/drivers/{id}/location` - 특정 운전자 위치 조회

---

## 상태 코드 정의

### 운전자 상태
- `"운행중"` - 현재 배차를 받아 운행하고 있는 상태
- `"대기"` - 배차 대기 중인 상태
- `"휴식"` - 휴식/휴무 상태

### 알림 타입
- `"error"` - 오류/에러 알림
- `"warning"` - 경고 알림
- `"info"` - 정보/안내 알림
- `"success"` - 성공/완료 알림

### 알림 우선순위
- `"urgent"` - 긴급 (즉시 확인 필요)
- `"high"` - 높음 (빠른 확인 필요)
- `"normal"` - 보통 (일반적인 알림)
- `"low"` - 낮음 (참고용 알림)

### 메시지 타입
- `"memo"` - 일반 메모
- `"alert"` - 경고 메시지
- `"instruction"` - 지시사항

---

## 에러 처리

모든 API에서 실패 시 다음과 같은 대체 처리를 수행합니다:

1. **데이터 조회 실패**: 로컬 더미 데이터 사용
2. **데이터 전송 실패**: 로컬 상태만 업데이트 후 사용자에게 알림
3. **네트워크 오류**: 적절한 에러 메시지 표시 및 재시도 옵션 제공

---

## 주요 컴포넌트 연동

### DriverListPanel
- 운전자 목록 표시 및 상태별 필터링
- 운전자 클릭 시 UserDetailModal 연동
- 운전자 이름 클릭 시 상세 페이지 이동

### UserDetailModal  
- 운전자 위치 정보 표시
- 메모 전송 기능
- 전송 완료 시 알림 자동 생성

### NotificationContext
- 모든 알림 통합 관리
- 자동 알림 생성 및 분류
- 읽음/삭제 상태 관리

### Map Components
- 실시간 위치 표시
- 버스/운전자 위치 마커 처리
- 위치 업데이트 자동 반영

---

## 개발 완료일: 2024년 1월 15일
## 최종 수정일: 2024년 1월 15일
## 문서 버전: v1.0
