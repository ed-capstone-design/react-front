# 버스 관리 API 문서

## 개요
버스 관리 시스템의 CRUD 작업을 위한 API 엔드포인트입니다.

## 인증
모든 API 요청에는 JWT 토큰이 필요합니다.
```
Authorization: Bearer <jwt_token>
```

## API 엔드포인트

### 1. 버스 목록 조회
```
GET /api/buses
```

**응답 예시:**
```json
{
  "success": true,
  "data": [
    {
      "busId": 1,
      "routeNumber": "101",
      "routeType": "CITY",
      "capacity": 45,
      "vehicleNumber": "서울70가1234",
      "vehicleType": "STANDARD",
      "vehicleYear": 2020,
      "lastMaintenance": "2024-01-15",
      "repairCount": 3,
      "operatorId": 1,
      "fuelType": "DIESEL"
    }
  ]
}
```

### 2. 버스 상세 조회
```
GET /api/buses/{busId}
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "busId": 1,
    "routeNumber": "101",
    "routeType": "CITY",
    "capacity": 45,
    "vehicleNumber": "서울70가1234",
    "vehicleType": "STANDARD",
    "vehicleYear": 2020,
    "lastMaintenance": "2024-01-15",
    "repairCount": 3,
    "operatorId": 1,
    "fuelType": "DIESEL"
  }
}
```

### 3. 버스 추가
```
POST /api/buses
```

**요청 본문:**
```json
{
  "routeNumber": "102",
  "routeType": "CITY",
  "capacity": 50,
  "vehicleNumber": "서울70가5678",
  "vehicleType": "STANDARD",
  "vehicleYear": 2023,
  "lastMaintenance": "2024-02-01",
  "repairCount": 0,
  "fuelType": "ELECTRIC"
}
```

**응답 예시:**
```json
{
  "success": true,
  "message": "버스가 성공적으로 추가되었습니다.",
  "data": {
    "busId": 2,
    "routeNumber": "102",
    "routeType": "CITY",
    "capacity": 50,
    "vehicleNumber": "서울70가5678",
    "vehicleType": "STANDARD",
    "vehicleYear": 2023,
    "lastMaintenance": "2024-02-01",
    "repairCount": 0,
    "operatorId": 1,
    "fuelType": "ELECTRIC"
  }
}
```

### 4. 버스 수정
```
PUT /api/buses/{busId}
```

**요청 본문:**
```json
{
  "routeNumber": "102",
  "routeType": "SUBURBAN",
  "capacity": 50,
  "vehicleNumber": "서울70가5678",
  "vehicleType": "STANDARD",
  "vehicleYear": 2023,
  "lastMaintenance": "2024-03-01",
  "repairCount": 1,
  "fuelType": "ELECTRIC"
}
```

**응답 예시:**
```json
{
  "success": true,
  "message": "버스 정보가 성공적으로 수정되었습니다.",
  "data": {
    "busId": 2,
    "routeNumber": "102",
    "routeType": "SUBURBAN",
    "capacity": 50,
    "vehicleNumber": "서울70가5678",
    "vehicleType": "STANDARD",
    "vehicleYear": 2023,
    "lastMaintenance": "2024-03-01",
    "repairCount": 1,
    "operatorId": 1,
    "fuelType": "ELECTRIC"
  }
}
```

### 5. 버스 삭제
```
DELETE /api/buses/{busId}
```

**응답 예시:**
```json
{
  "success": true,
  "message": "버스가 성공적으로 삭제되었습니다."
}
```

## 데이터 타입 및 제약사항

### RouteType (노선유형)
- `CITY`: 시내
- `SUBURBAN`: 시외  
- `EXPRESS`: 고속
- `INTERCITY`: 시외고속

### VehicleType (차량유형)
- `MINI`: 소형
- `STANDARD`: 일반
- `DOUBLE`: 2층

### FuelType (연료유형)
- `DIESEL`: 경유
- `LPG`: LPG
- `ELECTRIC`: 전기
- `HYBRID`: 하이브리드

### 필수 필드
- `routeNumber`: 노선번호 (VARCHAR 50)
- `routeType`: 노선유형
- `capacity`: 좌석수 (INT, 최소 1)
- `vehicleNumber`: 차량번호 (VARCHAR 20)
- `vehicleType`: 차량유형
- `vehicleYear`: 차량연식 (YEAR, 1990~현재년도+1)
- `fuelType`: 연료유형

### 선택 필드
- `lastMaintenance`: 최근 정비일 (DATE)
- `repairCount`: 정비횟수 (INT, 기본값 0)

## 에러 응답

### 400 Bad Request
```json
{
  "success": false,
  "error": "입력 데이터가 올바르지 않습니다.",
  "details": {
    "routeNumber": "노선번호는 필수입니다.",
    "capacity": "좌석수는 1 이상이어야 합니다."
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "인증이 필요합니다."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "접근 권한이 없습니다."
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "요청한 버스를 찾을 수 없습니다."
}
```

### 409 Conflict
```json
{
  "success": false,
  "error": "이미 존재하는 차량번호입니다."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "서버 내부 오류가 발생했습니다."
}
```

## 사용 예시

### JavaScript (Axios)
```javascript
// 버스 목록 조회
const getBuses = async () => {
  try {
    const response = await axios.get('/api/buses', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('버스 목록 조회 실패:', error);
  }
};

// 버스 추가
const addBus = async (busData) => {
  try {
    const response = await axios.post('/api/buses', busData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('버스 추가 실패:', error);
  }
};
```

## 주의사항

1. **차량번호 유일성**: 같은 운영사 내에서 차량번호는 중복될 수 없습니다.
2. **운영사 ID**: 현재 로그인한 사용자의 운영사 ID가 자동으로 설정됩니다.
3. **정비 관리**: `lastMaintenance`와 `repairCount`를 통해 정비 상태를 추적할 수 있습니다.
4. **데이터 검증**: 클라이언트와 서버 양쪽에서 데이터 유효성을 검사해야 합니다.
5. **삭제 제한**: 현재 배차에 사용 중인 버스는 삭제할 수 없습니다.
