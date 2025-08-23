# MyPage API 명세서

## 📝 **회원정보 수정 API**

### **1. 프로필 업데이트**

```http
PUT /api/user/profile
```

#### **Request Headers**
```json
{
  "Authorization": "Bearer {JWT_TOKEN}",
  "Content-Type": "application/json"
}
```

#### **Request Body**
```json
{
  "name": "박윤영",
  "email": "yun@example.com",
  "currentPassword": "현재비밀번호",  // 비밀번호 변경 시에만 필수
  "newPassword": "새비밀번호"        // 비밀번호 변경 시에만 필수
}
```

#### **Request Body 상세 설명**
- **name** (string, required): 사용자 이름
- **email** (string, required): 이메일 주소
- **currentPassword** (string, optional): 현재 비밀번호 (비밀번호 변경 시에만 필요)
- **newPassword** (string, optional): 새로운 비밀번호 (비밀번호 변경 시에만 필요)

#### **Response - 성공 (200 OK)**
```json
{
  "message": "프로필이 성공적으로 업데이트되었습니다.",
  "user": {
    "id": "user123",
    "name": "박윤영",
    "email": "yun@example.com",
    "role": "user",
    "updatedAt": "2025-08-22T10:30:00Z"
  }
}
```

#### **Response - 실패 예시**

**비밀번호 불일치 (400 Bad Request)**
```json
{
  "error": "INVALID_PASSWORD",
  "message": "현재 비밀번호가 일치하지 않습니다."
}
```

**유효하지 않은 이메일 (400 Bad Request)**
```json
{
  "error": "INVALID_EMAIL",
  "message": "이미 사용 중인 이메일입니다."
}
```

**인증 실패 (401 Unauthorized)**
```json
{
  "error": "UNAUTHORIZED",
  "message": "유효하지 않은 토큰입니다."
}
```

---

## 🗑️ **회원탈퇴 API**

### **2. 계정 삭제**

```http
DELETE /api/user/account
```

#### **Request Headers**
```json
{
  "Authorization": "Bearer {JWT_TOKEN}",
  "Content-Type": "application/json"
}
```

#### **Request Body**
```
없음 (JWT 토큰으로 사용자 식별)
```

#### **Response - 성공 (200 OK)**
```json
{
  "message": "회원 탈퇴가 완료되었습니다.",
  "deletedData": {
    "userId": "user123",
    "deletedRecords": {
      "drivingRecords": 15,
      "schedules": 8,
      "notifications": 23
    },
    "deletedAt": "2025-08-22T10:30:00Z"
  }
}
```

#### **Response - 실패 예시**

**인증 실패 (401 Unauthorized)**
```json
{
  "error": "UNAUTHORIZED",
  "message": "유효하지 않은 토큰입니다."
}
```

**서버 오류 (500 Internal Server Error)**
```json
{
  "error": "DELETION_FAILED",
  "message": "데이터 삭제 중 오류가 발생했습니다."
}
```

---

## 🔐 **인증 및 보안**

### **JWT 토큰 구조**
```json
{
  "userId": "user123",
  "username": "yun_driver",
  "name": "박윤영",
  "email": "yun@example.com",
  "role": "user",
  "operatorId": "COMPANY001",
  "exp": 1724323800,
  "aud": "driving-app"
}
```

### **토큰 검증 과정**
1. **Authorization 헤더 확인**: `Bearer {token}` 형식 검증
2. **토큰 서명 검증**: JWT 서명 유효성 확인
3. **만료시간 검증**: `exp` 클레임 확인
4. **대상자 검증**: `aud` 클레임이 "driving-app"인지 확인
5. **사용자 존재 확인**: 토큰의 `userId`로 사용자 조회

---

## 📋 **프론트엔드 구현 세부사항**

### **1. 프로필 업데이트 로직**

```javascript
const handleUpdateProfile = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    // 1. 비밀번호 변경 검증
    if (userInfo.newPassword && userInfo.newPassword !== userInfo.confirmPassword) {
      setError("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    // 2. 요청 데이터 구성
    const updateData = {
      name: userInfo.name,
      email: userInfo.email,
    };

    // 비밀번호 변경이 있는 경우에만 포함
    if (userInfo.currentPassword && userInfo.newPassword) {
      updateData.currentPassword = userInfo.currentPassword;
      updateData.newPassword = userInfo.newPassword;
    }

    // 3. API 호출 (JWT 토큰 자동 포함)
    await axios.put("/api/user/profile", updateData);
    
    // 4. 성공 처리
    toast.success("프로필이 성공적으로 업데이트되었습니다!");
    
    // 비밀번호 필드 초기화
    setLocalUserInfo(prev => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }));

  } catch (error) {
    // 5. 에러 처리
    handleError(error);
  } finally {
    setLoading(false);
  }
};
```

### **2. 회원탈퇴 로직**

```javascript
const handleDeleteAccount = async () => {
  // 1. 사용자 확인
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
    // 2. 토큰 포함하여 DELETE 요청
    const token = getToken();
    await axios.delete("/api/user/account", {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // 3. 성공 시 토큰 제거 및 리다이렉트
    alert("회원 탈퇴가 완료되었습니다.");
    removeToken();
    navigate("/signin");

  } catch (error) {
    // 4. 에러 처리
    handleError(error);
  } finally {
    setLoading(false);
  }
};
```

---

## 🛡️ **백엔드 구현 가이드 (Spring Boot 예시)**

### **1. 프로필 업데이트 컨트롤러**

```java
@RestController
@RequestMapping("/api/user")
public class UserController {

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
        @RequestBody UserUpdateRequest request,
        HttpServletRequest httpRequest
    ) {
        try {
            // 1. JWT 토큰에서 사용자 식별
            String token = extractTokenFromHeader(httpRequest);
            String userId = jwtUtil.getUserIdFromToken(token);
            
            User user = userService.findById(userId);
            if (user == null) {
                return ResponseEntity.status(404)
                    .body(Map.of("error", "USER_NOT_FOUND", "message", "사용자를 찾을 수 없습니다."));
            }

            // 2. 현재 비밀번호 검증 (비밀번호 변경 시)
            if (request.getCurrentPassword() != null) {
                if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                    return ResponseEntity.status(400)
                        .body(Map.of("error", "INVALID_PASSWORD", "message", "현재 비밀번호가 일치하지 않습니다."));
                }
            }

            // 3. 이메일 중복 검사
            if (!user.getEmail().equals(request.getEmail()) && 
                userService.existsByEmail(request.getEmail())) {
                return ResponseEntity.status(400)
                    .body(Map.of("error", "INVALID_EMAIL", "message", "이미 사용 중인 이메일입니다."));
            }

            // 4. 사용자 정보 업데이트
            user.setName(request.getName());
            user.setEmail(request.getEmail());
            
            if (request.getNewPassword() != null) {
                user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            }
            
            userService.save(user);

            // 5. 응답 데이터 구성
            Map<String, Object> response = Map.of(
                "message", "프로필이 성공적으로 업데이트되었습니다.",
                "user", Map.of(
                    "id", user.getId(),
                    "name", user.getName(),
                    "email", user.getEmail(),
                    "role", user.getRole(),
                    "updatedAt", user.getUpdatedAt()
                )
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", "UPDATE_FAILED", "message", "프로필 업데이트에 실패했습니다."));
        }
    }

    @DeleteMapping("/account")
    public ResponseEntity<?> deleteAccount(HttpServletRequest request) {
        try {
            // 1. JWT 토큰에서 사용자 식별
            String token = extractTokenFromHeader(request);
            String userId = jwtUtil.getUserIdFromToken(token);

            // 2. 연관된 모든 데이터 삭제 (트랜잭션)
            DeletionResult result = userService.deleteUserAndRelatedData(userId);

            // 3. 응답 데이터 구성
            Map<String, Object> response = Map.of(
                "message", "회원 탈퇴가 완료되었습니다.",
                "deletedData", Map.of(
                    "userId", userId,
                    "deletedRecords", result.getDeletedRecords(),
                    "deletedAt", Instant.now()
                )
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", "DELETION_FAILED", "message", "데이터 삭제 중 오류가 발생했습니다."));
        }
    }
}
```

### **2. 사용자 서비스 (트랜잭션 처리)**

```java
@Service
@Transactional
public class UserService {

    public DeletionResult deleteUserAndRelatedData(String userId) {
        DeletionResult result = new DeletionResult();

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
        // ...

        // 5. 마지막에 사용자 계정 삭제
        userRepository.deleteById(userId);

        return result;
    }
}
```

---

## 🚀 **테스트 예시**

### **cURL 테스트 명령어**

```bash
# 1. 프로필 업데이트 테스트
curl -X PUT http://localhost:8080/api/user/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "박윤영",
    "email": "newemail@example.com",
    "currentPassword": "oldpassword",
    "newPassword": "newpassword123"
  }'

# 2. 회원탈퇴 테스트
curl -X DELETE http://localhost:8080/api/user/account \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

이러한 API 구조로 안전하고 일관성 있는 회원정보 관리가 가능합니다!
