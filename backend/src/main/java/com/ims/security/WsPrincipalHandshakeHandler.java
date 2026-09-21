package com.ims.security;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeFailureException;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.Map;

/*
 * Spring's STOMP user-destination support (`/user/queue/...`, used by
 * NotificationService's convertAndSendToUser) resolves the target session
 * purely from `WebSocketSession.getPrincipal().getName()` — without a
 * Principal, a per-user message has nowhere to go and is dropped silently
 * (no exception, no log — it just never arrives, which is why this bug was
 * invisible until someone actually checked whether real-time push worked).
 *
 * WsJwtHandshakeInterceptor already validated the JWT and stashed the
 * username in the handshake attributes; this just promotes that into the
 * Principal every WebSocketSession carries from here on.
 */
@Component
public class WsPrincipalHandshakeHandler extends DefaultHandshakeHandler {

    @Override
    protected Principal determineUser(@NonNull org.springframework.http.server.ServerHttpRequest request,
            @NonNull WebSocketHandler wsHandler, @NonNull Map<String, Object> attributes) {
        Object username = attributes.get("username");
        if (username instanceof String s && !s.isBlank()) {
            return new StompPrincipal(s);
        }
        // Should be unreachable: WsJwtHandshakeInterceptor.beforeHandshake returns
        // false (aborting the handshake before it gets here) whenever it can't
        // resolve a username. Fail loudly instead of silently falling back to an
        // unauthenticated/anonymous session if that assumption is ever wrong.
        throw new HandshakeFailureException("No authenticated username on WebSocket handshake");
    }

    /** Minimal Principal — STOMP user-destination routing only needs getName(). */
    private record StompPrincipal(String name) implements Principal {
        @Override
        public String getName() {
            return name;
        }
    }
}
