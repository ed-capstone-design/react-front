# 버스/운전자 관리 시스템 ERD 및 테이블 구조

이 문서는 프론트엔드 개발 및 API 연동을 위한 데이터 모델, 테이블 구조, 주요 속성, 관계를 정리한 표준 레퍼런스입니다. 모든 데이터 모델, UI, API 로직은 이 구조를 기반으로 구현되어야 합니다.

---

## 1. User (사용자)
| 필드명         | 타입      | PK | FK | 설명             |
| -------------- | --------- |----|----|---------------- |
| id             | int       | Y  |    | 사용자 고유 ID   |
| username       | string    |    |    | 로그인 ID       |
| password       | string    |    |    | 비밀번호        |
| name           | string    |    |    | 이름            |
| role           | string    |    |    | 권한 (admin/driver) |
| phone          | string    |    |    | 연락처          |
| created_at     | datetime  |    |    | 가입일          |
| updated_at     | datetime  |    |    | 수정일          |

---

## 2. Driver (운전자)
| 필드명         | 타입      | PK | FK | 설명             |
| -------------- | --------- |----|----|---------------- |
| id             | int       | Y  |    | 운전자 고유 ID   |
| user_id        | int       |    | Y  | User.id (연결)   |
| license_no     | string    |    |    | 면허번호         |
| hire_date      | date      |    |    | 입사일           |
| status         | string    |    |    | 상태 (재직/퇴사 등) |
| phone          | string    |    |    | 연락처           |
| address        | string    |    |    | 주소             |
| created_at     | datetime  |    |    | 등록일           |
| updated_at     | datetime  |    |    | 수정일           |

---

## 3. Bus (버스)
| 필드명         | 타입      | PK | FK | 설명             |
| -------------- | --------- |----|----|---------------- |
| id             | int       | Y  |    | 버스 고유 ID     |
| bus_no         | string    |    |    | 버스 번호판      |
| model          | string    |    |    | 모델명           |
| capacity       | int       |    |    | 정원             |
| status         | string    |    |    | 상태 (운행/정비 등) |
| created_at     | datetime  |    |    | 등록일           |
| updated_at     | datetime  |    |    | 수정일           |

---

## 4. Schedule (운행 일정)
| 필드명         | 타입      | PK | FK | 설명             |
| -------------- | --------- |----|----|---------------- |
| id             | int       | Y  |    | 일정 고유 ID     |
| bus_id         | int       |    | Y  | Bus.id           |
| driver_id      | int       |    | Y  | Driver.id        |
| route          | string    |    |    | 노선명           |
| start_time     | datetime  |    |    | 출발 시간        |
| end_time       | datetime  |    |    | 도착 시간        |
| status         | string    |    |    | 상태 (운행중/종료/취소) |
| created_at     | datetime  |    |    | 등록일           |
| updated_at     | datetime  |    |    | 수정일           |

---

## 5. Notification (알림)
| 필드명         | 타입      | PK | FK | 설명             |
| -------------- | --------- |----|----|---------------- |
| id             | int       | Y  |    | 알림 고유 ID     |
| user_id        | int       |    | Y  | User.id (수신자) |
| title          | string    |    |    | 제목             |
| message        | string    |    |    | 내용             |
| type           | string    |    |    | 유형 (info/warning/error 등) |
| is_read        | boolean   |    |    | 읽음 여부        |
| created_at     | datetime  |    |    | 생성일           |

---

## 6. 기타 참고
- 모든 테이블은 created_at, updated_at 필드를 가짐 (생성/수정 시각)
- FK(외래키)는 실제 DB에서는 on delete cascade 등 정책 적용 가능
- role, status 등은 enum 또는 string으로 관리
- 실제 API 응답 예시는 각 Context/컴포넌트에서 참고

---

## ERD (관계 요약)
- User 1:N Driver (운전자 계정은 User와 연결)
- User 1:N Notification (알림 수신자)
- Driver 1:N Schedule (운전자별 운행 일정)
- Bus 1:N Schedule (버스별 운행 일정)

---

## API/프론트 개발 참고
- 모든 데이터 모델, UI, API 연동은 위 구조를 기준으로 구현
- Context/Provider에서 각 엔티티별 CRUD 함수 구현 (예: fetchDrivers, addDriver 등)
- NotificationContext, DriverContext 등에서 이 구조를 기반으로 상태 관리
- 동적 속성 접근 및 타입 일관성 유지
- 추가 확장(예: 정비 이력, 사고 이력 등)은 이 문서에 추가

---

> 본 문서는 시스템 구조 변경 시 반드시 최신화해야 하며, 모든 개발자는 이 문서를 기준으로 데이터 모델 및 API를 구현해야 합니다.
