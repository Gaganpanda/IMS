package com.ims.config;

import com.ims.security.WsJwtHandshakeInterceptor;
import com.ims.security.WsPrincipalHandshakeHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    // Bug fix: origins were hardcoded to localhost only, which silently broke
    // WebSocket connections in Docker/production. Now reuses the same
    // configurable property as REST CORS (app.cors.allowed-origins).
    @Value("${app.cors.allowed-origins:http://localhost:3000,http://localhost:5173}")
    private String allowedOrigins;

    private final WsJwtHandshakeInterceptor wsJwtHandshakeInterceptor;
    private final WsPrincipalHandshakeHandler wsPrincipalHandshakeHandler;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Client subscribes to /topic/... for broadcasts
        registry.enableSimpleBroker("/topic", "/queue");
        // Client sends to /app/...
        registry.setApplicationDestinationPrefixes("/app");
        // User-specific messages go to /user/queue/...
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Bug fix: the handshake previously had no authentication mechanism at
        // all, so per-user push notifications (convertAndSendToUser) silently
        // never reached anyone — see WsJwtHandshakeInterceptor and
        // WsPrincipalHandshakeHandler for the full explanation. The client now
        // connects to /ws?token=<jwt>; the interceptor validates that token and
        // the handshake handler turns it into a real Principal.
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(allowedOrigins.split("\\s*,\\s*"))
                .addInterceptors(wsJwtHandshakeInterceptor)
                .setHandshakeHandler(wsPrincipalHandshakeHandler)
                .withSockJS();
    }
}

