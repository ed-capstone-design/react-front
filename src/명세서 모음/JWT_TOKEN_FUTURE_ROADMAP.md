# 🔮 JWT 토큰 시스템 확장 계획 (Future Roadmap)

## 📅 **단계별 확장 계획**

### **Phase 1: 토큰 지속성 향상 (높은 우선순위)**

#### **1.1 자동 토큰 갱신 (Auto Refresh)**
- **목표**: 사용자 경험 향상, 로그인 끊김 방지
- **구현 범위**:
  ```javascript
  // TokenProvider에 추가할 기능
  const refreshToken = async () => {
    // 만료 5분 전 자동 갱신
    // 백엔드 /api/auth/refresh 호출
    // 새 토큰으로 교체
  };
  ```
- **백엔드 요구사항**:
  - `POST /api/auth/refresh` API 구현
  - Refresh Token 발급 시스템
  - 토큰 만료 시간 설정 (24시간 권장)

#### **1.2 토큰 만료 예측 알림**
- **목표**: 갑작스러운 로그아웃 방지
- **구현 범위**:
  ```javascript
  // 만료 5분 전 사용자 알림
  const TokenExpirationWarning = () => {
    // Toast 알림으로 연장 옵션 제공
    // 자동 갱신 또는 수동 연장 선택
  };
  ```

### **Phase 2: 사용자 경험 개선 (중간 우선순위)**

#### **2.1 로그인 상태 실시간 모니터링**
- **목표**: 토큰 상태 시각화
- **구현 범위**:
  ```javascript
  // 개발자 모드 디버깅 도구
  const TokenStatusMonitor = () => {
    // 토큰 만료까지 남은 시간 표시
    // 권한 정보 실시간 확인
    // 토큰 유효성 상태 표시
  };
  ```

#### **2.2 권한별 라우팅 가드**
- **목표**: 세밀한 접근 제어
- **구현 범위**:
  ```javascript
  // 권한별 컴포넌트 보호
  const ProtectedRoute = ({ requiredAuthority, children }) => {
    // authorities 배열 기반 접근 제어
    // 권한 없을 시 적절한 안내 페이지
  };
  ```

### **Phase 3: 보안 강화 (낮은 우선순위)**

#### **3.1 다중 디바이스 관리**
- **목표**: 보안성 향상
- **구현 범위**:
  - 동시 로그인 제한
  - 디바이스별 토큰 관리
  - 원격 로그아웃 기능

#### **3.2 토큰 사용 패턴 분석**
- **목표**: 비정상 접근 탐지
- **구현 범위**:
  - API 호출 패턴 모니터링
  - 로그인 시간/위치 추적
  - 이상 행동 알림

### **Phase 4: 성능 최적화 (추후)**

#### **4.1 토큰 캐싱 시스템**
- **목표**: 성능 향상
- **구현 범위**:
  ```javascript
  // 파싱된 사용자 정보 메모화
  const useMemoizedUserInfo = () => {
    return useMemo(() => getUserInfoFromToken(), [token]);
  };
  ```

#### **4.2 Context 최적화**
- **목표**: 불필요한 리렌더링 방지
- **구현 범위**:
  - React.memo 활용
  - 토큰 변경 시만 업데이트
  - 선택적 구독 패턴

---

## 🛠 **구현 가이드라인**

### **백엔드 개발자를 위한 요구사항**

#### **Refresh Token API**
```java
@PostMapping("/api/auth/refresh")
public ResponseEntity<JwtResponse> refreshToken(
    @RequestHeader("Authorization") String authHeader) {
    
    // 1. 현재 토큰 검증
    // 2. 새 토큰 발급 (만료 시간 연장)
    // 3. 선택적: Refresh Token 갱신
    
    return ResponseEntity.ok(new JwtResponse(newToken));
}
```

#### **토큰 만료 시간 설정**
```java
// 권장 설정
private static final long ACCESS_TOKEN_VALIDITY = 24 * 60 * 60 * 1000; // 24시간
private static final long REFRESH_TOKEN_VALIDITY = 7 * 24 * 60 * 60 * 1000; // 7일
```

### **프론트엔드 개발자를 위한 가이드**

#### **토큰 갱신 Hook**
```javascript
const useTokenRefresh = () => {
  const { setToken, isTokenValid } = useToken();
  
  const refreshToken = useCallback(async () => {
    try {
      const response = await axios.post('/api/auth/refresh');
      setToken(response.data.token);
      return true;
    } catch (error) {
      // 갱신 실패 시 로그아웃
      return false;
    }
  }, [setToken]);
  
  return { refreshToken };
};
```

#### **만료 알림 컴포넌트**
```javascript
const TokenExpirationAlert = () => {
  const [showAlert, setShowAlert] = useState(false);
  const { refreshToken } = useTokenRefresh();
  
  // 만료 5분 전 알림 로직
  
  return showAlert && (
    <Alert type="warning">
      로그인이 곧 만료됩니다.
      <Button onClick={refreshToken}>연장</Button>
    </Alert>
  );
};
```

---

## 📋 **개발 순서 권장사항**

### **1단계: 기본 토큰 갱신**
1. 백엔드 Refresh API 구현
2. 프론트엔드 토큰 갱신 로직
3. 자동 갱신 타이머 설정

### **2단계: 사용자 알림**
1. 만료 시간 계산 로직
2. Toast/Alert 컴포넌트 연동
3. 사용자 선택 옵션 제공

### **3단계: 고급 기능**
1. 권한별 라우팅 가드
2. 토큰 상태 모니터링
3. 성능 최적화

---

## 🎯 **성공 지표**

### **사용자 경험**
- 로그인 끊김으로 인한 작업 손실 0%
- 토큰 만료 알림 노출률 < 5%
- 자동 갱신 성공률 > 95%

### **보안성**
- 만료된 토큰 사용 시도 0건
- 비정상 접근 탐지 및 차단
- 권한 없는 페이지 접근 방지

### **성능**
- 토큰 파싱 시간 < 1ms
- 불필요한 리렌더링 < 10%
- 메모리 사용량 최적화

---

**📌 이 확장 계획은 필요에 따라 단계별로 구현하며, 사용자 피드백을 바탕으로 우선순위를 조정할 수 있습니다.**
