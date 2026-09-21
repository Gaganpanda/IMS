package com.ims.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

/*
 * ── Authenticates the SockJS/STOMP handshake ──
 *
 * Bug fix: the WebSocket endpoint previously had no authentication at all —
 * SecurityConfig requires a Bearer header for every non-public path, but a
 * browser's native WebSocket upgrade (and SockJS's XHR fallback) cannot
 * attach a custom Authorization header, so `/ws/**` had to be made public
 * just to let the handshake complete at all. That alone would have let
 * anyone connect anonymously. On top of that, nothing ever set a Principal
 * on the session, so `SimpMessagingTemplate.convertAndSendToUser(username,
 * ...)` in NotificationService had no session to route to — the "real-time"
 * push notification was silently a no-op for every user, always falling
 * back to the 60-second poll.
 *
 * Fix: the frontend connects to `/ws?token=<jwt>` (a query param, since
 * that's the one thing client-side JS *can* attach to a WebSocket/SockJS
 * URL). This interceptor validates that token the same way JwtFilter does
 * for REST calls, and rejects the handshake outright (returns false, which
 * yields an HTTP 200 with the handshake simply not proceeding) if the token
 * is missing, malformed, expired, or references a user that no longer
 * exists. The resolved username is stashed in the WebSocket session
 * attributes so WsPrincipalHandshakeHandler can turn it into a real
 * Principal — see that class for why a Principal is required for
 * convertAndSendToUser to work at all.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class WsJwtHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
            WebSocketHandler wsHandler, Map<String, Object> attributes) {

        String token = extractToken(request);
        if (token == null || token.isBlank()) {
            log.debug("WebSocket handshake rejected: no token provided");
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return false;
        }

        try {
            String username = jwtUtil.extractUsername(token);
            if (username == null) {
                response.setStatusCode(HttpStatus.UNAUTHORIZED);
                return false;
            }
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            if (!jwtUtil.isTokenValid(token, userDetails)) {
                log.debug("WebSocket handshake rejected: invalid/expired token for '{}'", username);
                response.setStatusCode(HttpStatus.UNAUTHORIZED);
                return false;
            }
            attributes.put("username", username);
            return true;
        } catch (Exception e) {
            // Covers a malformed/tampered JWT (JwtException) and a token whose
            // subject no longer resolves to a real user (UsernameNotFoundException) —
            // either way, the handshake is refused rather than allowed through
            // unauthenticated.
            log.debug("WebSocket handshake rejected: {}", e.getMessage());
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return false;
        }
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
            WebSocketHandler wsHandler, Exception exception) {
        // Nothing to do — attributes are already captured in beforeHandshake.
    }

    /*
     * Reads ?token=... from the handshake request's query string. Only the
     * Servlet-backed request type actually exposes a query string this way;
     * any other implementation (not expected in this app's setup) simply
     * yields no token, which beforeHandshake then correctly rejects.
     */
    private String extractToken(ServerHttpRequest request) {
        if (!(request instanceof ServletServerHttpRequest servletRequest)) {
            return null;
        }
        return servletRequest.getServletRequest().getParameter("token");
    }
}
