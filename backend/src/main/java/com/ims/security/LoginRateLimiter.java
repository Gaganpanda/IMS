package com.ims.security;

import com.ims.exception.TooManyRequestsException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Simple in-memory sliding-window rate limiter for the login endpoint,
 * keyed by client IP. This is deliberately dependency-free (no Bucket4j /
 * Redis) so it works out of the box; for a multi-instance deployment behind
 * a load balancer, back this with a shared store (e.g. Redis) instead.
 *
 * Protects against brute-force / credential-stuffing scripts hammering the
 * endpoint from a single source, independently of the per-account lockout
 * in {@link com.ims.service.AuthService}.
 */
@Component
public class LoginRateLimiter {

    @Value("${app.security.rate-limit.max-attempts:15}")
    private int maxAttemptsPerWindow;

    @Value("${app.security.rate-limit.window-seconds:300}")
    private long windowSeconds;

    private final ConcurrentHashMap<String, Window> attemptsByIp = new ConcurrentHashMap<>();

    public void checkAllowed(String clientIp) {
        Window window = attemptsByIp.computeIfAbsent(clientIp, k -> new Window(Instant.now()));

        synchronized (window) {
            if (Instant.now().isAfter(window.windowStart.plusSeconds(windowSeconds))) {
                window.windowStart = Instant.now();
                window.count.set(0);
            }

            if (window.count.incrementAndGet() > maxAttemptsPerWindow) {
                throw new TooManyRequestsException(
                    "Too many login attempts from this network. Please wait a few minutes and try again.");
            }
        }
    }

    /** Called after a successful login so a legitimate user isn't penalised for earlier retries. */
    public void reset(String clientIp) {
        attemptsByIp.remove(clientIp);
    }

    private static final class Window {
        volatile Instant windowStart;
        final AtomicInteger count = new AtomicInteger(0);

        Window(Instant start) { this.windowStart = start; }
    }
}
