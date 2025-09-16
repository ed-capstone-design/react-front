## DB 테이블 구조 요약

### operator (운영사)
| 컬럼명        | 타입           | 제약조건      | 설명      |
|---------------|---------------|--------------|-----------|
| operatorId    | INT           | PK           | 운영사 ID |
| operatorCode  | VARCHAR(20)   |              | 코드      |
| operatorName  | VARCHAR(100)  |              | 이름      |

### admin (관리자)
| 컬럼명        | 타입           | 제약조건                        | 설명      |
|---------------|---------------|----------------------------------|-----------|
| adminId       | INT           | PK                               | 관리자 ID |->유저로 변경
| adminName     | VARCHAR(50)   |                                  | 이름      |->유저에 포함
| adminPassword | VARCHAR(255)  |                                  | 비밀번호  |->유저에 포함
| operatorId    | INT           | FK → operator(operatorId)        | 운영사 ID |->유저에 포함

### driver (운전자)
| 컬럼명           | 타입           | 제약조건                        | 설명      |
|------------------|---------------|----------------------------------|-----------|
| driverId         | INT           | PK                               | 운전자 ID |->유저로 변경
| driverName       | VARCHAR(100)  |                                  | 이름      |->이름 삭제
| driverPassword   | VARCHAR(255)  |                                  | 비밀번호  |->없움
| licenseNumber    | VARCHAR(50)   |                                  | 면허번호  |
| operatorId       | INT           | FK → operator(operatorId)        | 운영사 ID |->없음
| careerYears      | INT           |                                  | 경력(년)  |
| avgDrivingScore  | DECIMAL(4,2)  |                                  | 평균점수  |
| grade            | ENUM('A','B','C','D','E') |                      | 등급      |
| driverImagePath  | VARCHAR(255)  |                                  | 이미지 경로|

### bus (버스)
| 컬럼명         | 타입           | 제약조건                        | 설명      |
|----------------|---------------|----------------------------------|-----------|
| busId          | INT           | PK                               | 버스 ID   |
| routeNumber    | VARCHAR(50)   |                                  | 노선번호  |
| routeType      | ENUM('CITY','COMMUTER','TOWN','EXPRESS','INTERCITY') | | 노선유형  |
| capacity       | INT           |                                  | 좌석수    |
| vehicleNumber  | VARCHAR(20)   |                                  | 차량번호  |
| vehicleType    | ENUM('MINI','STANDARD','DOUBLE') |              | 차량유형  |
| vehicleYear    | YEAR          |                                  | 차량연식  |
| lastMaintenance| DATE          |                                  | 최근정비일|
| repairCount    | INT           |                                  | 정비횟수  |
| operatorId     | INT           | FK → operator(operatorId)        | 운영사 ID |
| fuelType       | ENUM('DIESEL','LPG','ELECTRIC','HYBRID') |      | 연료유형  |

### dispatch (배차)
| 컬럼명             | 타입           | 제약조건                        | 설명      |
|--------------------|---------------|----------------------------------|-----------|
| dispatchId         | INT           | PK                               | 배차 ID   |
| driverId           | INT           | FK → driver(driverId)            | 운전자 ID |
| busId              | INT           | FK → bus(busId)                  | 버스 ID   |
| status             | ENUM('SCHEDULED','DELAYED','COMPLETED','CANCELLED') | | 상태      |
| dispatchDate       | DATE          |                                  | 배차일    |
| scheduledDeparture | TIME          |                                  | 예정출발  |
| actualDeparture    | TIME          |                                  | 실제출발  |
| actualArrival      | TIME          |                                  | 실제도착  |
| warningCount       | INT           |                                  | 경고수    |
| drivingScore       | INT           |                                  | 운행점수  |

### warning (경고)
| 컬럼명      | 타입           | 제약조건                        | 설명      |
|-------------|---------------|----------------------------------|-----------|
| warningId   | INT           | PK                               | 경고 ID   |
| dispatchId  | INT           | FK → dispatch(dispatchId)        | 배차 ID   |
| warningTime | DATETIME      |                                  | 경고시간  |
| warningType | ENUM('SPEEDING','DROWSY','HARSH_BRAKING','ETC') | | 경고종류 |

### warning_image (경고 이미지)
| 컬럼명      | 타입           | 제약조건                        | 설명      |
|-------------|---------------|----------------------------------|-----------|
| imageId     | INT           | PK, AUTO_INCREMENT               | 이미지 ID |
| warningId   | INT           | FK → warning(warningId)          | 경고 ID   |
| sequence    | INT           |                                  | 순번      |
| imagePath   | VARCHAR(255)  |                                  | 이미지 경로|
