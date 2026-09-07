package com.ims.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
@Slf4j
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration}")
    private long expiration;

    /*
     * FIX: getSigningKey() below used to zero-pad any secret shorter than 32
     * bytes up to 32 bytes. That "works" (HS256 will accept the key) but
     * silently throws away real security — a short secret like "changeme"
     * gets padded with 24 zero bytes, so the effective key entropy is still
     * just "changeme", not a real 256-bit key. That's the dangerous kind of
     * bug: nothing breaks in dev, tokens still sign and verify fine, and the
     * weakness only matters the day someone tries to brute-force or forge a
     * token in production. Fail fast at startup instead, so a weak secret is
     * caught in the deploy pipeline, not discovered during an incident.
     */
    @PostConstruct
    private void validateSecret() {
        int bytes = secret == null ? 0 : secret.getBytes(StandardCharsets.UTF_8).length;
        if (bytes < 32) {
            throw new IllegalStateException(
                "app.jwt.secret must be at least 32 bytes (256 bits) for HS256 — configured value is only "
                    + bytes + " bytes. Set a longer JWT_SECRET before starting the application.");
        }
    }

    /* ── Generate token ── */
    public String generateToken(UserDetails userDetails) {
        return buildToken(new HashMap<>(), userDetails.getUsername(), expiration);
    }

    private String buildToken(Map<String, Object> extraClaims, String subject, long expMs) {
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(subject)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /* ── Validate ── */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
        } catch (JwtException e) {
            log.warn("JWT validation failed: {}", e.getMessage());
            return false;
        }
    }

    /* ── Extract claims ── */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        return resolver.apply(extractAllClaims(token));
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /* ── use secret bytes directly — no double-encoding ── */
    private Key getSigningKey() {
        // validateSecret() above guarantees at least 32 bytes at startup, so this
        // only ever truncates a longer configured secret down to the 256 bits
        // HS256 needs — it never has to pad a short one with zero bytes anymore.
        byte[] secretBytes = secret.getBytes(StandardCharsets.UTF_8);
        byte[] keyBytes    = new byte[32];
        System.arraycopy(secretBytes, 0, keyBytes, 0, 32);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
