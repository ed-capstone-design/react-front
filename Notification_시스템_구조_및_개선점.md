# Notification(알림) 시스템 구조 및 개선점 정리

## 1. 현재 Notification 시스템 사용 방식

- **Context 구조**:  
  `NotificationContext`에서 알림 목록, 읽음/삭제/추가/필터링 등 모든 알림 관련 상태와 메서드를 관리.  
  `useNotifications()` 훅으로 컴포넌트에서 알림 데이터와 메서드 사용.

- **알림 데이터 로딩**:  
  1. `/api/notifications`에서 알림 목록을 불러옴(실제 API가 있을 때).
  2. API가 없으면 Warning, Schedule 등 다른 데이터로부터 mock 알림을 생성.

- **알림 데이터 구조**:  
  ```js
  {
    id, title, message, timestamp, read, type, priority, action, ...
  }
  ```
  (현재는 sender/receiver 정보 없음)

- **주요 메서드**:  
  - `markAsRead(id)`: 알림 읽음 처리
  - `removeNotification(id)`: 알림 삭제
  - `markAllAsRead()`: 전체 읽음 처리
  - `addNotification(notification)`: 새 알림 추가
  - `getFilteredNotifications(filter)`: 필터링된 알림 목록 반환

- **UI 연동**:  
  - `AlertSummaryWidget`, `NotificationPanel` 등에서 알림 현황, 목록, 필터, 조치 버튼 등 표시

---

## 2. 현재 구조의 문제점 및 한계

- **수신자/발신자 정보 부재**  
  - 여러 명의 관리자가 있을 때, "누가 보냈고 누가 받는지" 정보가 없음  
  - 모든 알림이 모든 사용자에게 동일하게 노출됨 (개인화 불가)

- **알림 권한/대상 지정 불가**  
  - 특정 관리자/유저에게만 알림을 보내거나, 그룹별 알림 발송이 불가능

- **확장성 부족**  
  - senderId, receiverId, receiverIds 등 필드가 없어 향후 멀티유저/권한 기반 알림 시스템으로 확장 어려움

- **실제 API 연동 미흡**  
  - mock 데이터 생성 로직이 많고, 실제 백엔드와의 연동이 완전하지 않음

- **알림 유형/상태 관리 한계**  
  - type, priority 등은 있으나, 알림의 세부 분류(예: 시스템/경고/스케줄/커스텀 등) 확장에 한계

---

## 3. 개선점 및 권장 구조

- **알림 데이터 구조 확장**
  ```js
  {
    id,
    title,
    message,
    senderId,      // 발신자(관리자/시스템) ID
    senderName,    // (선택) 발신자 이름
    receiverId,    // 수신자(관리자/유저) ID
    receiverName,  // (선택) 수신자 이름
    // 또는 receiverIds: [] (여러 명일 경우)
    timestamp,
    read,
    type,
    priority,
    action,
    ...기타 필요 필드
  }
  ```

- **API 설계**
  - GET /api/notifications?receiverId=xxx : 내 알림만 조회
  - POST /api/notifications : sender/receiver 지정하여 알림 생성
  - PUT/DELETE 등도 receiverId 기반으로 처리

- **Context/Provider 개선**
  - 알림 생성/조회/삭제 시 sender/receiver 정보 포함
  - mock 데이터 생성 시에도 sender/receiver 필드 추가

- **UI 개선**
  - "내가 받은 알림"만 필터링, "누가 보냈는지" 표시 등

- **확장성 고려**
  - 그룹 알림, 전체 알림, 특정 역할별 알림 등도 지원 가능하도록 receiverIds 등 배열 구조 고려

---

## 4. 요약

- 현재는 단일 사용자/관리자 기준의 단순 알림 구조
- 여러 명의 관리자가 알림을 주고받는 구조로 확장하려면 sender/receiver 필드 추가가 필수
- API, 데이터 모델, Context, UI 모두 이에 맞게 개선 필요

---

> 이 문서는 Notification 시스템 구조 개선 및 확장 설계 참고용입니다.
