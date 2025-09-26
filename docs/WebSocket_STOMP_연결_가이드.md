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
