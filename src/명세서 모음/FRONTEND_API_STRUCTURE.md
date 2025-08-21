# 프론트엔드 ↔ 백엔드 API 연동 구조 정리

## 1. 공통 사항
- 모든 API 요청은 axios를 사용
- 기본 경로 예시: `/api/엔드포인트`
- 응답 데이터는 대부분 JSON 배열 또는 객체

---

## 2. 운전자(Driver) 관리

### 목록 조회
- **GET** `/api/drivers`
- 응답 예시:
  ```json
  [
    {
      "driverId": 1,
      "driverName": "홍길동",
      "driverPassword": "...",
      "licenseNumber": "12-3456789",
      "operatorId": 1,
      "careerYears": 3,
      "avgDrivingScore": 95.5,
      "grade": "A",
      "driverImagePath": "...",
      "status": "운행중"
    },
    ...    git credential-cache exit
  ]
  ```

### 운전자 추가
- **POST** `/api/drivers`
- 요청 body 예시:
  ```json
  {
    "driverName": "홍길동",
    "driverPassword": "1234",
    "licenseNumber": "12-3456789",
    "operatorId": 1,
    "careerYears": 3,
    "avgDrivingScore": 95.5,
    "grade": "A",
    "driverImagePath": "",
    "status": "운행중"
  }
  ```
- 응답: 추가된 운전자 객체

---

## 3. 운행 스케줄(Dispatch) 관리

### 목록 조회
- **GET** `/api/dispatch`
- 응답 예시:
  ```json
  [
    {
      "dispatchId": 1,
      "driverId": 1,
      "busId": 2,
      "status": "SCHEDULED",
      "dispatchDate": "2024-06-01",
      "scheduledDeparture": "08:00:00",
      "actualDeparture": null,
      "actualArrival": null,
      "warningCount": 0,
      "drivingScore": 0
    },
    ...
  ]
  ```

### 스케줄 추가
- **POST** `/api/dispatch`
- 요청 body 예시:
  ```json
  {
    "driverId": 1,
    "busId": 2,
    "dispatchDate": "2024-06-01",
    "scheduledDeparture": "08:00:00",
    "actualDeparture": null,
    "actualArrival": null
    // status, warningCount, drivingScore 등은 백엔드에서 기본값 처리 가능
  }
  ```
- 응답: 추가된 스케줄 객체

---

## 4. 지도(카카오맵)
- 별도의 API 요청 없음
- markers 배열로 좌표 및 이미지 정보만 전달

---

## 5. 기타
- 모든 POST/PUT 요청은 JSON body로 전송
- 모든 응답은 JSON

---
