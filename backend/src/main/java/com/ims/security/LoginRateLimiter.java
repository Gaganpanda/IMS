package com.ims.security;

import com.ims.exception.TooManyRequestsException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
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

    /*
     * FIX: this map previously had no eviction path at all — every distinct IP
     * that ever hit /auth/login (including one-off failed attempts, scanners,
     * and anyone on a dynamic/shared IP) stayed in memory for the lifetime of
     * the JVM. On a public-facing deployment that's slow, unbounded heap growth
     * that only shows up weeks/months into production as GC pressure or an
     * eventual OutOfMemoryError — exactly the kind of "works fine in testing,
     * takes the site down later" bug that's hard to catch before real traffic.
     * Runs hourly and drops any window whose 5-minute period has long since
     * closed, independent of the request-time cleanup in checkAllowed().
     */
    @Scheduled(fixedRate = 60 * 60 * 1000)
    public void evictStaleWindows() {
        Instant cutoff = Instant.now().minusSeconds(windowSeconds * 2);
        int before = attemptsByIp.size();
        attemptsByIp.entrySet().removeIf(e -> e.getValue().windowStart.isBefore(cutoff));
        int removed = before - attemptsByIp.size();
        if (removed > 0) {
            org.slf4j.LoggerFactory.getLogger(LoginRateLimiter.class)
                    .debug("Evicted {} stale rate-limit window(s); {} remaining", removed, attemptsByIp.size());
        }
    }

    /** Exposed for monitoring/tests only. */
    public int trackedIpCount() {
        return attemptsByIp.size();
    }

    private static final class Window {
        volatile Instant windowStart;
        final AtomicInteger count = new AtomicInteger(0);

        Window(Instant start) { this.windowStart = start; }
    }
}
