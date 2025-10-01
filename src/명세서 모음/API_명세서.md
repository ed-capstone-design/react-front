# API 명세서

| 엔드포인트         | 메서드 | 요청 파라미터         | 응답 구조 예시                | 상태 코드 | 인증 방식   |
|-------------------|--------|-----------------------|-------------------------------|-----------|-------------|
| /api/buses        | GET    | 없음                  | { buses: [ ... ] }            | 200, 500  | JWT Bearer   |
| /api/drivers/:id  | GET    | path: id              | { id, name, ... }             | 200, 404  | JWT Bearer   |
| /api/schedules    | POST   | body: { ... }         | { success: true/false }        | 201, 400  | JWT Bearer   |
| /api/notifications| GET    | query: page, size     | { notifications: [ ... ] }     | 200, 401  | JWT Bearer   |
| ...               | ...    | ...                   | ...                           | ...       | ...          |

- **상태 코드:** 200(성공), 201(생성), 400(잘못된 요청), 401(인증 실패), 404(없음), 500(서버 오류)
- **인증 방식:** JWT 토큰(Authorization: Bearer {token})
