# 백엔드 WebSocket 설정 가이드

## ⚠️ 긴급 해결책 1: WebSocketSecurityConfig.java 임시 수정

기존 WebSocketSecurityConfig를 임시로 모든 메시지를 허용하도록 수정:

```java
@Configuration
public class WebSocketSecurityConfig extends AbstractSecurityWebSocketMessageBrokerConfigurer {

    @Override
    protected void configureInbound(MessageSecurityMetadataSourceRegistry messages) {
        messages
                // 임시로 모든 WebSocket 메시지 허용 (개발/테스트용)
                .anyMessage().permitAll();
    }

    @Override
    protected boolean sameOriginDisabled() {
        return true;
    }
}
```

## ⚠️ 긴급 해결책 2: SecurityConfig.java에 추가

WebSocket 엔드포인트에 대한 HTTP 인증을 비활성화:

```java
@Override
protected void configure(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests(authz -> authz
            .requestMatchers("/ws/**", "/ws/info/**", "/sockjs-node/**").permitAll() // WebSocket 관련 모든 경로 허용
            // ... 기존 설정
        );
}
```

또는 Spring Boot 3.x 방식:

```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests(authz -> authz
            .requestMatchers("/ws/**").permitAll()
            .requestMatchers("/app/**").permitAll()
            .requestMatchers("/topic/**").permitAll()
            .requestMatchers("/queue/**").permitAll()
            // ... 기존 설정
        );
    return http.build();
}
```

## WebSocketConfig.java 수정

```java
package com.drive.backend.drive_api.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Autowired
    private WebSocketAuthInterceptor webSocketAuthInterceptor;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:3000")
                .withSockJS();
    }

    // 인바운드 채널에 JWT 인증 인터셉터 등록
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(webSocketAuthInterceptor);
    }
}
```

## JwtUtils.java에 추가할 메서드

```java
// JWT에서 역할 정보 추출
public List<String> getRolesFromJwtToken(String token) {
    Claims claims = Jwts.parser()
            .setSigningKey(jwtSecret)
            .parseClaimsJws(token)
            .getBody();
    
    String role = claims.get("role", String.class);
    return role != null ? List.of(role) : List.of("USER");
}
```

## SecurityConfig.java 수정

WebSocket 엔드포인트에 대한 HTTP 접근 허용:

```java
@Override
protected void configure(HttpSecurity http) throws Exception {
    http
        // ... 기존 설정
        .authorizeHttpRequests(authz -> authz
            .requestMatchers("/ws/**", "/ws/info/**").permitAll() // SockJS 엔드포인트 허용
            // ... 기타 설정
        );
}
```