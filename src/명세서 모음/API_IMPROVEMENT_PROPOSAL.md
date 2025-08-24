# 🚀 API 구조 개선 제안서 (v3.0)

## 📋 **문서 정보**
- **작성일**: 2024년 8월 25일
- **버전**: v3.0 개선 제안
- **상태**: 제안 단계 (미적용)
- **목적**: API 구조 단순화 및 일관성 확보

---

## 🎯 **개선 목표**

### **핵심 아이디어**
- **쿼리 파라미터 통합**: 개별 엔드포인트를 쿼리 파라미터로 통합
- **API 개수 대폭 감소**: 23개 → 6개 (74% 감소)
- **일관성 있는 구조**: 모든 GET API가 동일한 패턴

---

## 📊 **현재 vs 개선안 비교**

### **🔴 현재 API 구조 (23개)**

#### **운전자 관리 (5개)**
```http
GET /api/drivers                    # 전체 목록
GET /api/drivers/{id}               # 특정 운전자
POST /api/drivers                   # 추가
PUT /api/drivers/{id}               # 수정
DELETE /api/drivers/{id}            # 삭제
```

#### **버스 관리 (6개)**
```http
GET /api/buses                      # 전체 목록
GET /api/buses/{id}                 # 특정 버스
GET /api/buses/locations            # 실시간 위치
POST /api/buses                     # 추가
PUT /api/buses/{id}                 # 수정
DELETE /api/buses/{id}              # 삭제
```

#### **배차 관리 (6개)**
```http
GET /api/dispatch/by-date           # 날짜별 조회
GET /api/dispatch/driver/{id}       # 운전자별 조회
GET /api/dispatch/{id}              # 특정 배차
POST /api/dispatch                  # 추가
PUT /api/dispatch/{id}              # 수정
DELETE /api/dispatch/{id}           # 삭제
```

#### **알림 관리 (5개)**
```http
GET /api/notifications              # 목록 조회
POST /api/notifications             # 생성
PUT /api/notifications/{id}/read    # 읽음 처리
PUT /api/notifications/read-all     # 전체 읽음
DELETE /api/notifications/{id}      # 삭제
```

#### **기타 (1개)**
```http
GET /api/warnings?dispatchId={id}   # 특정 운행 경고
GET /api/obd/current/{busId}        # 실시간 OBD
```

---

### **🟢 개선안 API 구조 (6개 GET + 수정 API들)**

#### **✨ 통합된 조회 API (6개)**

##### **1. 운전자 통합 API**
```http
GET /api/drivers
```
**쿼리 파라미터 옵션:**
- `?id={id}` - 특정 운전자 조회
- `?status={status}` - 상태별 필터 (운행중, 대기, 휴식)
- `?operatorId={id}` - 회사별 필터
- `?grade={grade}` - 등급별 필터 (S, A, B, C)
- `?limit={n}&offset={n}` - 페이징

**사용 예시:**
```javascript
// 현재
await axios.get('/api/drivers/1');
await axios.get('/api/drivers');

// 개선안
await axios.get('/api/drivers?id=1');
await axios.get('/api/drivers');
await axios.get('/api/drivers?status=운행중');
await axios.get('/api/drivers?grade=A&limit=10');
```

##### **2. 버스 통합 API**
```http
GET /api/buses
```
**쿼리 파라미터 옵션:**
- `?id={id}` - 특정 버스 조회
- `?routeType={type}` - 노선 타입별 (CITY, EXPRESS)
- `?fuelType={type}` - 연료별 (DIESEL, ELECTRIC, HYBRID)
- `?vehicleType={type}` - 차량 타입별 (MINI, STANDARD, DOUBLE)
- `?operatorId={id}` - 회사별 필터
- `?locations=true` - 실시간 위치 포함

**사용 예시:**
```javascript
// 현재
await axios.get('/api/buses/101');
await axios.get('/api/buses/locations');

// 개선안
await axios.get('/api/buses?id=101');
await axios.get('/api/buses?locations=true');
await axios.get('/api/buses?fuelType=ELECTRIC');
```

##### **3. 배차 통합 API (가장 강력한 개선)**
```http
GET /api/dispatch
```
**쿼리 파라미터 옵션:**
- `?id={id}` - 특정 배차 조회
- `?driverId={id}` - 운전자별 조회
- `?date={date}` - 날짜별 조회
- `?busId={id}` - 버스별 조회
- `?status={status}` - 상태별 (SCHEDULED, RUNNING, DELAYED, COMPLETED)
- `?startDate={date}&endDate={date}` - 기간별 조회
- `?limit={n}&offset={n}` - 페이징

**사용 예시:**
```javascript
// 현재 (3개 API)
await axios.get('/api/dispatch/123');
await axios.get('/api/dispatch/driver/1');
await axios.get('/api/dispatch/by-date?date=2024-08-25');

// 개선안 (1개 API)
await axios.get('/api/dispatch?id=123');
await axios.get('/api/dispatch?driverId=1');
await axios.get('/api/dispatch?date=2024-08-25');
await axios.get('/api/dispatch?status=RUNNING&date=2024-08-25');
```

##### **4. 알림 통합 API**
```http
GET /api/notifications
```
**쿼리 파라미터 옵션:**
- `?id={id}` - 특정 알림 조회
- `?read={boolean}` - 읽음 상태별 (true/false)
- `?type={type}` - 타입별 (warning, success, info, error)
- `?priority={priority}` - 우선순위별 (urgent, high, normal, low)
- `?driverId={id}` - 운전자별
- `?dispatchId={id}` - 배차별
- `?limit={n}&offset={n}` - 페이징

**사용 예시:**
```javascript
// 현재
await axios.get('/api/notifications');

// 개선안
await axios.get('/api/notifications?read=false');
await axios.get('/api/notifications?type=warning&priority=high');
await axios.get('/api/notifications?driverId=1');
```

##### **5. 경고 통합 API**
```http
GET /api/warnings
```
**쿼리 파라미터 옵션:**
- `?dispatchId={id}` - 특정 운행 경고 (기존 유지)
- `?driverId={id}` - 운전자별 경고
- `?warningType={type}` - 타입별 (SPEEDING, DROWSY, HARSH_BRAKING)
- `?severity={level}` - 심각도별 (HIGH, MEDIUM, LOW)
- `?date={date}` - 날짜별
- `?busId={id}` - 버스별

**사용 예시:**
```javascript
// 현재
await axios.get('/api/warnings?dispatchId=123');

// 개선안 (동일 + 확장)
await axios.get('/api/warnings?dispatchId=123');
await axios.get('/api/warnings?driverId=1&date=2024-08-25');
await axios.get('/api/warnings?warningType=SPEEDING');
```

##### **6. OBD 통합 API**
```http
GET /api/obd
```
**쿼리 파라미터 옵션:**
- `?busId={id}&current=true` - 실시간 OBD (기존 유지)
- `?busId={id}&date={date}` - 특정 날짜 데이터
- `?busId={id}&startDate={date}&endDate={date}` - 기간별 데이터

**사용 예시:**
```javascript
// 현재
await axios.get('/api/obd/current/101');

// 개선안
await axios.get('/api/obd?busId=101&current=true');
await axios.get('/api/obd?busId=101&date=2024-08-25');
```

---

## 📈 **개선 효과**

### **📊 API 개수 비교**

| 분류 | 현재 | 개선안 | 감소율 |
|------|------|--------|--------|
| **운전자** | 5개 | 1개 GET + 3개 CUD | 60% ↓ |
| **버스** | 6개 | 1개 GET + 3개 CUD | 67% ↓ |
| **배차** | 6개 | 1개 GET + 3개 CUD | 67% ↓ |
| **알림** | 5개 | 1개 GET + 4개 CUD | 60% ↓ |
| **경고** | 1개 | 1개 GET | 유지 |
| **OBD** | 1개 | 1개 GET | 유지 |
| **전체** | **24개** | **10개** | **58% 감소** |

### **🎯 핵심 장점**

#### **1. 일관성 확보**
- 모든 GET API가 동일한 패턴
- 예측 가능한 API 구조
- 학습 비용 대폭 감소

#### **2. 유연성 증대**
- 다중 필터 조합 가능
- 새로운 필터 쉽게 추가
- 복잡한 조회 조건 지원

#### **3. 성능 최적화**
- 필요한 데이터만 조회
- 페이징 표준화
- 캐싱 전략 단순화

#### **4. 개발 생산성**
- API 문서 단순화
- 프론트엔드 코드 일관성
- 백엔드 로직 재사용

---

## 🔧 **구현 전략**

### **📋 1단계: 백엔드 API 확장**
```javascript
// 기존 단일 엔드포인트 유지하면서 쿼리 파라미터 지원 추가
router.get('/api/drivers', (req, res) => {
  const { id, status, operatorId, grade, limit, offset } = req.query;
  
  if (id) {
    // 특정 운전자 조회
    return getDriverById(id);
  }
  
  // 필터 조건에 따라 조회
  return getDrivers({ status, operatorId, grade, limit, offset });
});
```

### **📋 2단계: 프론트엔드 점진적 마이그레이션**
```javascript
// 기존 코드는 유지하면서 새로운 방식 적용
// 기존
const driver = await axios.get(`/api/drivers/${driverId}`);

// 새로운 방식
const driver = await axios.get(`/api/drivers?id=${driverId}`);
```

### **📋 3단계: 기존 엔드포인트 Deprecated**
- 기존 API는 유지하되 Deprecated 마킹
- 새로운 개발은 통합 API 사용
- 점진적으로 기존 API 제거

---

## ⚡ **실제 사용 시나리오**

### **🎯 복잡한 조회 예시**

#### **시나리오 1: 특정 날짜 운행중인 A등급 운전자들**
```javascript
// 현재: 여러 API 호출 필요
const drivers = await axios.get('/api/drivers');
const schedules = await axios.get('/api/dispatch/by-date?date=2024-08-25');
// 프론트에서 복잡한 필터링 필요

// 개선안: 단일 API 호출
const drivers = await axios.get('/api/drivers?grade=A&status=운행중');
const schedules = await axios.get('/api/dispatch?date=2024-08-25&status=RUNNING');
```

#### **시나리오 2: 특정 운전자의 지난주 경고 분석**
```javascript
// 현재: 불가능하거나 복잡한 로직 필요

// 개선안: 간단한 쿼리
const warnings = await axios.get('/api/warnings?driverId=1&startDate=2024-08-18&endDate=2024-08-25');
```

#### **시나리오 3: 전기 버스들의 실시간 위치**
```javascript
// 현재: 전체 조회 후 프론트에서 필터링

// 개선안: 백엔드에서 필터링
const electricBuses = await axios.get('/api/buses?fuelType=ELECTRIC&locations=true');
```

---

## 💡 **추가 개선 아이디어**

### **🔍 GraphQL 스타일 필드 선택**
```javascript
// 필요한 필드만 선택적으로 조회
await axios.get('/api/drivers?fields=driverName,status,grade');
```

### **🔄 실시간 구독 API**
```javascript
// WebSocket 기반 실시간 업데이트
ws://api/drivers?subscribe=true&status=운행중
```

### **📊 통계 API 통합**
```javascript
// 집계 함수 지원
await axios.get('/api/drivers?aggregate=count&groupBy=status');
```

---

## 📝 **마이그레이션 체크리스트**

### **✅ 백엔드 작업**
- [ ] 쿼리 파라미터 파싱 로직 구현
- [ ] 다중 필터 조건 처리
- [ ] 페이징 표준화
- [ ] 입력 값 검증 강화
- [ ] 응답 형식 통일

### **✅ 프론트엔드 작업**
- [ ] API 호출 함수 리팩토링
- [ ] 에러 처리 통일
- [ ] 로딩 상태 관리 개선
- [ ] 캐싱 전략 재설계

### **✅ 문서화 작업**
- [ ] API 명세서 업데이트
- [ ] 사용 예시 추가
- [ ] 마이그레이션 가이드 작성

---

## 🎉 **결론**

이 개선안을 적용하면:

1. **API 개수 58% 감소** (24개 → 10개)
2. **일관성 있는 구조** 확보
3. **유연한 조회 조건** 지원
4. **개발 생산성 대폭 향상**
5. **유지보수 비용 절감**

**추천 적용 순서**: 배차 API → 운전자 API → 버스 API → 알림 API

---

## 📅 **적용 일정 (예상)**

- **Week 1-2**: 백엔드 통합 API 개발
- **Week 3-4**: 프론트엔드 마이그레이션
- **Week 5**: 테스트 및 버그 수정
- **Week 6**: 기존 API Deprecated

---

*본 문서는 API 구조 개선을 위한 제안서이며, 실제 적용 전 충분한 검토가 필요합니다.*
