# 회원탈퇴 API 명세서

## 🗑️ **회원탈퇴 API**

### **API 엔드포인트**
```http
DELETE /api/user/account
```

---

## 📤 **Request (요청)**

### **Request Headers**
```json
{
  "Authorization": "Bearer {JWT_TOKEN}",
  "Content-Type": "application/json"
}
```

### **Request Body**
```
없음 (JWT 토큰으로 사용자 식별)
```

### **헤더 상세 설명**
- **Authorization** (string, required): JWT 토큰으로 사용자 인증
- **Content-Type** (string, required): 응답 형식 지정

---

## 📥 **Response (응답)**

### **성공 응답 (200 OK)**
```json
{
  "message": "회원 탈퇴가 완료되었습니다.",
  "userId": "user123",
  "deletedAt": "2025-08-22T10:30:00Z"
}
```

### **실패 응답 예시**

#### **인증 실패 (401 Unauthorized)**
```json
{
  "error": "UNAUTHORIZED",
  "message": "유효하지 않은 토큰입니다."
}
```

#### **토큰 만료 (401 Unauthorized)**
```json
{
  "error": "TOKEN_EXPIRED",
  "message": "토큰이 만료되었습니다. 다시 로그인해주세요."
}
```

#### **사용자 없음 (404 Not Found)**
```json
{
  "error": "USER_NOT_FOUND",
  "message": "해당 사용자를 찾을 수 없습니다."
}
```

#### **서버 오류 (500 Internal Server Error)**
```json
{
  "error": "DELETION_FAILED",
  "message": "데이터 삭제 중 오류가 발생했습니다."
}
```

---

## 💻 **프론트엔드 구현**

### **현재 MyPage에서의 구현**

```javascript
const handleDeleteAccount = async () => {
  // 1. 사용자 확인 대화상자
  const confirmed = window.confirm(
    "정말로 회원탈퇴를 하시겠습니까?\n\n" +
    "⚠️ 탈퇴 시 다음 정보가 모두 삭제됩니다:\n" +
    "• 운전 기록 및 평가 점수\n" +
    "• 스케줄 및 배차 정보\n" +
    "• 등록된 개인정보\n\n" +
    "이 작업은 되돌릴 수 없습니다."
  );

  if (!confirmed) return;

  setLoading(true);
  setError("");

  try {
    // 2. JWT 토큰 포함해서 DELETE 요청
    const token = getToken();
    await axios.delete("/api/user/account", {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // 3. 성공 시 처리
    alert("회원 탈퇴가 완료되었습니다.");
    removeToken();         // localStorage에서 토큰 제거
    navigate("/signin");   // 로그인 페이지로 리다이렉트

  } catch (error) {
    // 4. 에러 처리
    if (error.response) {
      setError(error.response.data.message || "회원 탈퇴에 실패했습니다.");
    } else {
      setError("서버 연결에 실패했습니다.");
    }
    toast.error("회원 탈퇴에 실패했습니다.");
  } finally {
    setLoading(false);
  }
};
```

---

## 🛡️ **백엔드 구현 가이드 (Spring Boot)**

### **컨트롤러**

```java
@RestController
@RequestMapping("/api/user")
public class UserController {

    @DeleteMapping("/account")
    public ResponseEntity<?> deleteAccount(HttpServletRequest request) {
        try {
            // 1. JWT 토큰에서 사용자 식별
            String token = extractTokenFromHeader(request);
            String userId = jwtUtil.getUserIdFromToken(token);
            
            // 2. 사용자 존재 확인
            User user = userService.findById(userId);
            if (user == null) {
                return ResponseEntity.status(404)
                    .body(Map.of("error", "USER_NOT_FOUND", "message", "해당 사용자를 찾을 수 없습니다."));
            }

            // 3. 연관된 모든 데이터 삭제 (트랜잭션)
            DeletionResult result = userService.deleteUserAndRelatedData(userId);

            // 4. 응답 데이터 구성
            Map<String, Object> response = Map.of(
                "message", "회원 탈퇴가 완료되었습니다.",
                "userId", userId,
                "deletedAt", Instant.now()
            );

            return ResponseEntity.ok(response);

        } catch (JwtException e) {
            return ResponseEntity.status(401)
                .body(Map.of("error", "UNAUTHORIZED", "message", "유효하지 않은 토큰입니다."));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", "DELETION_FAILED", "message", "데이터 삭제 중 오류가 발생했습니다."));
        }
    }
    
    private String extractTokenFromHeader(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        throw new IllegalArgumentException("Invalid authorization header");
    }
}
```

### **서비스 (트랜잭션 처리)**

```java
@Service
@Transactional
public class UserService {

    public DeletionResult deleteUserAndRelatedData(String userId) {
        DeletionResult result = new DeletionResult();

        try {
            // 1. 운전 기록 삭제
            int drivingRecords = drivingRecordRepository.deleteByUserId(userId);
            result.addDeletedRecords("drivingRecords", drivingRecords);

            // 2. 스케줄 정보 삭제
            int schedules = scheduleRepository.deleteByUserId(userId);
            result.addDeletedRecords("schedules", schedules);

            // 3. 알림 삭제
            int notifications = notificationRepository.deleteByUserId(userId);
            result.addDeletedRecords("notifications", notifications);

            // 4. 기타 연관 데이터 삭제
            int otherData = otherDataRepository.deleteByUserId(userId);
            result.addDeletedRecords("otherData", otherData);

            // 5. 마지막에 사용자 계정 삭제
            userRepository.deleteById(userId);
            result.addDeletedRecords("personalInfo", 1);

            return result;

        } catch (Exception e) {
            // 트랜잭션 롤백됨
            throw new RuntimeException("데이터 삭제 실패: " + e.getMessage());
        }
    }
}

// 삭제 결과를 담는 클래스
@Data
public class DeletionResult {
    private Map<String, Integer> deletedRecords = new HashMap<>();
    
    public void addDeletedRecords(String type, int count) {
        deletedRecords.put(type, count);
    }
}
```

---

## 🚀 **테스트 예시**

### **cURL 테스트**

```bash
# 회원탈퇴 테스트
curl -X DELETE http://localhost:8080/api/user/account \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -v
```

### **성공 응답 예시**
```json
{
  "message": "회원 탈퇴가 완료되었습니다.",
  "userId": "user123",
  "deletedAt": "2025-08-22T10:30:00Z"
}
```

---

## 🔐 **보안 고려사항**

### **1. 토큰 검증**
- JWT 서명 검증
- 토큰 만료시간 확인
- 대상자(audience) 검증

### **2. 사용자 확인**
- 토큰의 userId와 삭제 대상 일치 확인
- 권한 검증 (본인만 삭제 가능)

### **3. 트랜잭션 처리**
- 모든 연관 데이터 원자적 삭제
- 실패 시 롤백 보장

### **4. 로그 기록**
- 삭제 작업 감사 로그
- 복구를 위한 백업 (선택적)

---

## 📋 **삭제되는 데이터 목록**

1. **개인정보**
   - 사용자 기본 정보 (이름, 이메일 등)
   - 로그인 정보

2. **운전 관련 데이터**
   - 운전 기록 및 평가 점수
   - 운행 히스토리

3. **스케줄 정보**
   - 배차 정보
   - 운행 스케줄

4. **알림 데이터**
   - 개인 알림 기록
   - 푸시 알림 설정

5. **기타 연관 데이터**
   - 세션 정보
   - 임시 데이터

이렇게 **완전한 데이터 삭제**로 개인정보보호법을 준수합니다! 🛡️
