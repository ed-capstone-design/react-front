# WebSocket/STOMP 연결 가이드 (프론트 디버깅 + 백엔드 전달용)

본 문서는 React(SockJS + STOMP)에서 JWT 인증 기반 WebSocket 연결 문제를 진단하고 해결하는 절차를 정리합니다. 현재 관찰된 현상은 HTTP/SockJS 핸드셰이크는 통과하지만, STOMP CONNECT 처리 단계에서 서버가 ERROR 프레임을 내려보내는 상황입니다.

## 1) 현재 증상 요약
- 브라우저 STOMP 디버그 로그:
  - Opening Web Socket → Web Socket Opened → >>> CONNECT (Authorization: Bearer <JWT> 포함)
  - <<< ERROR message: Failed to send message to ExecutorSubscribableChannel[clientInboundChannel]
- 의미: 서버 inbound 채널에서 STOMP CONNECT 처리 중 예외(대개 AccessDenied)가 발생.
- 결론: 프론트는 Authorization 헤더를 제대로 전송하고 있고, 서버의 STOMP CONNECT 인증/인가 처리에 문제가 있음.

---

## 2) 프론트 점검 체크리스트 (React)
프론트는 아래 상태면 정상입니다.
- SockJS 사용: `new SockJS("http://localhost:8080/ws")`
- STOMP Client: `webSocketFactory: () => socket`
- CONNECT 헤더: `connectHeaders: { Authorization: 'Bearer ' + token }`
- 토큰 유효성 사전 검사: 만료/손상 토큰이면 연결 시도 중단

파일 위치: `src/components/WebSocket/WebSocketProvider.jsx`
- CONNECT 헤더 단일화(Authorization만): 적용됨
- isTokenValid() 체크: 적용됨
- 중복 연결 방지/수동 연결 버튼(TopNav): 적용됨

브라우저 DevTools 확인(필수):
- Network → WS → `/ws` 선택 → Messages → 첫 프레임 `CONNECT` 클릭
- Headers에 `Authorization:Bearer eyJ...`가 보이면 프런트는 정상 전송

---

## 3) 프론트 디버깅 포인트 (권장 브레이크포인트)
`WebSocketProvider.jsx`의 `connect()` 내부
- token/userInfo 취득 직후: 값 확인
- `new SockJS(...)` 직후: socket 생성 여부
- `new Client({...})` 직후: `connectHeaders.Authorization` 값 확인
- `stompClient.current.activate()` 직후: STOMP 디버그 로그 흐름 확인
- `onConnect` 첫 줄: 성공 시 frame 확인
- `onStompError` 첫 줄: 실패 시 `frame.headers.message`, `frame.body` 확인

DevTools 설정
- Sources → Pause on exceptions(Checked: Caught) → STOMP 내부 에러 포인트 추적

---

## 4) 백엔드 수정 가이드 (핵심)
HTTP 보안은 SockJS 핸드셰이크를 통과시키고, STOMP CONNECT에서 JWT를 인증해야 합니다.

1) SockJS 엔드포인트 노출
```java
registry.addEndpoint("/ws")
        .setAllowedOriginPatterns("http://localhost:3000")
        .withSockJS();
```

2) HTTP 보안에서 `/ws/**`, `/ws/info/**` 허용 + JWT 필터 제외
```java
http.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/auth/**", "/ws/**", "/actuator/health", "/health").permitAll()
    .anyRequest().authenticated()
);
// JwtAuthFilter.shouldNotFilter에서 request.getServletPath().startsWith("/ws") 시 스킵
```

3) STOMP CONNECT 인증 인터셉터 (필수)
- STOMP CONNECT 시 Authorization 헤더에서 JWT 추출 → 검증 → Authentication 생성 → Principal 세팅
- 이 인터셉터는 보안 인터셉터보다 먼저 실행되어야 함

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

  private final JwtTokenProvider jwtTokenProvider; // 주입

  public WebSocketConfig(JwtTokenProvider jwtTokenProvider) {
    this.jwtTokenProvider = jwtTokenProvider;
  }

  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/ws")
            .setAllowedOriginPatterns("http://localhost:3000")
            .withSockJS();
  }

  @Override
  public void configureClientInboundChannel(ChannelRegistration registration) {
    registration.interceptors(new ChannelInterceptor() {
      @Override
      public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
          String raw = accessor.getFirstNativeHeader("Authorization");
          if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("Missing Authorization header in STOMP CONNECT");
          }
          String token = raw.startsWith("Bearer ") ? raw.substring(7) : raw;

          if (!jwtTokenProvider.validateToken(token)) {
            throw new IllegalArgumentException("Invalid JWT");
          }
          Authentication auth = jwtTokenProvider.getAuthentication(token);
          if (auth == null) {
            throw new IllegalStateException("Failed to build Authentication from JWT");
          }
          accessor.setUser(auth); // Principal 세팅
        }
        return message;
      }
    });
  }
}
```

4) 메시지 보안 규칙 (진단 → 정상화)
```java
@Configuration
public class WebSocketSecurityConfig extends AbstractSecurityWebSocketMessageBrokerConfigurer {
  @Override
  protected void configureInbound(MessageSecurityMetadataSourceRegistry messages) {
    messages
      .simpTypeMatchers(SimpMessageType.HEARTBEAT).permitAll()
      // 진단 단계: CONNECT permitAll 로 연결 확인 후 → authenticated 로 복귀
      .simpTypeMatchers(SimpMessageType.CONNECT).authenticated()
      .simpSubscribeDestMatchers("/topic/**", "/queue/**").authenticated()
      .simpMessageDestMatchers("/app/**").authenticated()
      .anyMessage().authenticated();
  }
  @Override
  protected boolean sameOriginDisabled() { return true; }
}
```

5) JwtTokenProvider 구현 주의
- `validateToken(token)`, `getAuthentication(token)`은 HttpServletRequest에 의존하지 않고 **토큰만**으로 동작해야 함
- 반환된 `Authentication`의 `Authorities`에 기대 ROLE이 들어가야 구독/발행 보안 규칙 통과

6) 로그 레벨(진단 시)
```properties
logging.level.org.springframework.messaging=DEBUG
logging.level.org.springframework.security.messaging=DEBUG
logging.level.org.springframework.web.socket=DEBUG
```
- CONNECT 인터셉터에 다음 로그 추가 권장: Authorization 유무, validate 결과, auth.name/authorities, setUser 이후

---

## 5) 백엔드 팀에 보낼 템플릿 ✉️
> 현상: 웹(React)은 SockJS/WS까지 열리고 CONNECT 전송 후 서버에서 ERROR: "Failed to send message to ExecutorSubscribableChannel[clientInboundChannel]"가 돌아옵니다. 안드로이드는 정상입니다.
>
> 증거: CONNECT 프레임에 `Authorization: Bearer <JWT>`가 포함되어 있음을 브라우저 WS Messages 캡처로 확인했습니다(캡처 첨부).
>
> 요청:
> 1) `clientInboundChannel`에 `ChannelInterceptor`를 추가해 STOMP CONNECT 시 Authorization 헤더의 JWT를 검증하고 `accessor.setUser(auth)`로 Principal을 세팅해 주세요.
> 2) 위 인터셉터가 보안 인터셉터보다 먼저 실행되도록 등록 순서를 보장해 주세요.
> 3) 메시지 보안에서 CONNECT를 일시 `permitAll`로 두고 연결이 성공하는지 확인 후, `authenticated`로 되돌려 주세요.
> 4) `JwtTokenProvider.getAuthentication(token)`이 HttpServletRequest 없이 토큰만으로 동작하는지, 반환 Authentication의 권한이 기대 ROLE을 포함하는지 점검 부탁드립니다.
> 5) 진단 시 `org.springframework.messaging`, `org.springframework.security.messaging`, `org.springframework.web.socket` 로그를 DEBUG로 올려 실패 지점을 캡처해 주세요.

---

## 6) 단계별 검증 순서 (실행 체크리스트)
1) `/ws/info` 200 확인 (HTTP 보안/필터 예외 OK)
2) 프론트에서 수동 연결(TopNav의 "연결" 버튼) → CONNECTED 수신 확인
3) 진단 필요 시: CONNECT를 잠시 `permitAll` → 연결 성공 여부 확인 → 이후 `authenticated` 복귀
4) 구독(`/topic/**`, `/queue/**`)과 발행(`/app/**`)을 하나씩 되살리며 권한/경로 점검
5) 필요 시 간단한 ping/echo로 왕복 확인

부가: ping/echo 예시 (백엔드)
```java
@MessageMapping("/ping")
@SendTo("/topic/pong")
public String ping(String payload) {
  return "pong:" + payload;
}
```
프론트 발행/구독 예시
```js
// 구독: stompClient.subscribe('/topic/pong', msg => console.log(msg.body));
// 발행: stompClient.publish({ destination: '/app/ping', body: 'hi' });
```

---

## 7) 자주 발생하는 실수 🧩
- Authorization 철자/대소문자 불일치 → 반드시 "Authorization"
- "Bearer " 접두사 공백 누락/과다 → 정확히 "Bearer <토큰>"
- CONNECT 인증을 HTTP 필터에서 처리하려고 시도 → 브라우저는 WS 업그레이드 HTTP 헤더에 Authorization을 실어보내기 어렵고, STOMP CONNECT 헤더에서 처리해야 안정적
- `getAuthentication(token)`이 HttpServletRequest를 요구 → 토큰만으로 동작하도록 변경 필요
- 메시지 보안에서 CONNECT에 ROLE 요구 → Authentication 권한 세팅 누락 시 AccessDenied

---

## 8) 결론
- 프론트는 Authorization을 STOMP CONNECT에 정상 전송하고 있으며, 토큰 만료도 아님.
- 서버에서 STOMP CONNECT 인증(Authorization 헤더 → JWT 검증 → Principal 세팅)과 메시지 보안 규칙의 정렬이 필요합니다.
- 위 가이드를 적용 후, 연결 성공(Connected) → 구독/발행 순차 확인으로 마무리하세요.

---

## 9) (추가) Optimistic 구독 & Receipt 프로브 전략
프론트는 실제 사용 구독을 receipt 없이 먼저 수행(낙관적 구독)하고, 별도 testSubscribe로 receipt 지원 여부를 비동기 확인합니다.

| 단계 | 목적 | 동작 |
|------|------|------|
| subscribePersistent('/user/queue/notifications') | 실사용 핸들러 등록 | receipt 없이 SUBSCRIBE 즉시 수행 |
| testSubscribe 동일 경로 | 브로커 receipt 지원 여부 탐지 | receipt 기대, 미수신 시 경고 로그만 출력 |

브로커가 SUBSCRIBE receipt를 지원하지 않아도 정상 동작하며, 경고 로그는 치명 아님.

## 10) (추가) Notification Payload 표준 스키마
백엔드 전송 예 (user queue):
```jsonc
{
  "notificationId": 6,
  "message": "경고: 서울2가124 차량(김테스트)에서 BRAKING 이벤트 발생",
  "notificationType": "DRIVING_WARNING",
  "relatedUrl": "/dispatches/2",
  "createdAt": "2025-09-28T23:41:29.152382",
  "isRead": false,
  "payload": {               // 가변 필드 컨테이너
    "dispatchId": 2,
    "vehicleNumber": "서울2가124",
    "driverName": "김테스트",
    "latitude": null,
    "longitude": null,
    "scheduledDepartureTime": "2025-09-29T09:10:00"
  }
}
```
프론트 처리 규칙:
1. JSON 파싱 후 `payload` 존재 시 평탄화: `{...root, ...root.payload}`
2. 필드 충돌 시 payload 값이 우선(운영 필요 시 문서화 권장)
3. `createdAt` 마이크로초(6자리) → 밀리초 3자리로 truncate 시도 후 Date 파싱

권장: 백엔드에서 ISO 8601 UTC (예: `2025-09-28T23:41:29.152Z`) 일관 출력.

## 11) (추가) Notification Type UX 정책
| notificationType | Toast 레벨 | 설명 |
|------------------|------------|------|
| ALERT | error | 긴급(치명) 알림 |
| WARNING | warning | 일반 경고 |
| DRIVING_WARNING | warning | 운행 이벤트 경고 (브레이킹 등) |
| 기타(INFO 등) | 없음 | 리스트에는 반영, 토스트 생략 |

확장 방법: switch-case 또는 매핑 테이블로 error/warning/info 분리.

## 12) (추가) 콘솔 진단 로그 패턴
| 로그 태그 | 의미 |
|-----------|------|
| `[Notification] 구독 핸들러 등록됨(낙관)` | subscribePersistent 완료, handler 설치 |
| `[Notification] 구독 확정 성공(receipt)` | testSubscribe에서 receipt 수신 |
| `[Notification] 구독 확정 실패/미확인` | receipt 미지원 또는 미수신 (치명 아님) |
| `[Notification][INCOMING] {...}` | 실시간 수신된 알림 payload 디버그 덤프 |

운영 전환 시 receipt 실패 경고는 debug 레벨로 낮추는 것을 권장.

## 13) (추가) 재연결 & 재구독 전략
현재 구현: 최초 1회 구독 후 `didSubscribeRef` 플래그로 중복 방지.
위험: 세션 재생성(네트워크 끊김) 후 재구독 누락 가능.
개선안 중 하나:
```js
stompClient.onWebSocketClose = () => { didSubscribeRef.current = false; };
// 또는 onConnect 내부에서 항상 구독하고 idempotent 처리
```

## 14) (추가) convertAndSendToUser 사용 주의
올바른 호출:
```java
messagingTemplate.convertAndSendToUser(principalName, "/queue/notifications", payload);
```
실수 사례: `"/user/queue/notifications"`로 전송 → 매칭 실패.
Principal 이름 = `Authentication.getName()` 과 동일해야 함.

체크리스트:
- [ ] Principal null 아님 (CONNECT 인터셉터 확인)
- [ ] principalName 일관 (이메일 vs 내부 ID 혼용 금지)
- [ ] destination prefix `/queue` 사용 (`/topic` 아님)

## 15) (추가) Ping/Echo (User Queue) 진단 예제
백엔드:
```java
@MessageMapping("/test/ping")
@SendToUser("/queue/notifications")
public Map<String,Object> ping(Map<String,Object> in, Principal p) {
  return Map.of(
    "notificationId", 999999,
    "message", "pong:" + in.get("x"),
    "notificationType", "WARNING",
    "createdAt", Instant.now().toString(),
    "isRead", false
  );
}
```
프론트:
```js
stompClient.publish({ destination: '/app/test/ping', body: JSON.stringify({ x: 'hello' }) });
```
수신되면 개인 큐 라우팅/Principal 정상.

## 16) (추가) Heartbeat 설정 권장
현재 서버 응답: `heart-beat:0,0` → 끊김 감지 취약.
SimpleBroker heartbeat 예:
```java
registry.enableSimpleBroker("/topic", "/queue").setHeartbeatValue(new long[]{10000,10000})
        .setTaskScheduler(taskScheduler());
```

## 17) (추가) Principal & JWT Claim 매핑
문제 패턴: JWT `sub` = email, DB userId 별도 → convertAndSendToUser에 userId 사용 시 mismatch.
정책 결정 필요:
1) getAuthentication()에서 Username = email로 고정
2) 아니면 프론트/토큰 생성 시 subject를 userId로 통일

## 18) (추가) 운영 전환 시 Log Level 권장
| 영역 | 개발 | 운영 |
|------|------|------|
| STOMP debug | 활성 | 비활성 |
| 구독 receipt 경고 | warn | debug |
| INCOMING payload | info | debug (PII/민감 데이터 주의) |

---

## 19) (추가) 빠른 종합 체크리스트
- [ ] CONNECT 프레임 Authorization 헤더 포함
- [ ] CONNECT 인터셉터에서 Principal 세팅 로그
- [ ] SUBSCRIBE 로그 destination=/user/queue/notifications, user!=null
- [ ] convertAndSendToUser dest="/queue/notifications" (앞에 /user 없음)
- [ ] principalName 일치 (auth.getName())
- [ ] 알림 payload 스키마 준수 (notificationId, notificationType, createdAt 등)
- [ ] DRIVING_WARNING 토스트 경고로 표출
- [ ] 재연결 시 재구독 보장 또는 설계적 불필요 확인
- [ ] ping 테스트 통과
- [ ] heartbeat 설정(운영)

