package com.ims.service;

import com.ims.dto.AuthDTO;
import com.ims.exception.AccountLockedException;
import com.ims.model.User;
import com.ims.repository.UserRepository;
import com.ims.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

/**
 * Handles authentication with enterprise-grade safeguards:
 *  - Account lockout after repeated failed attempts (brute-force protection)
 *  - Generic, non-enumerating error messages
 *  - Last-login auditing
 *  - Automatic unlock once the lockout window elapses (see {@link User#isAccountNonLocked()})
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository        userRepository;
    private final JwtUtil               jwtUtil;

    /** Consecutive failed attempts allowed before the account is locked. */
    @Value("${app.security.max-failed-attempts:5}")
    private int maxFailedAttempts;

    /** Lockout duration (minutes) once the threshold above is exceeded. */
    @Value("${app.security.lockout-duration-minutes:15}")
    private long lockoutDurationMinutes;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("hh:mm a");

    /* ── Login ── */
    @Transactional
    public AuthDTO.LoginResponse login(AuthDTO.LoginRequest request) {
        String username = request.getUsername() == null ? "" : request.getUsername().trim();

        try {
            Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, request.getPassword())
            );

            User user = (User) auth.getPrincipal();
            onLoginSuccess(user);

            String jwt = jwtUtil.generateToken(user);
            log.info("User '{}' logged in successfully", user.getUsername());

            return AuthDTO.LoginResponse.builder()
                    .token(jwt)
                    .tokenType("Bearer")
                    .user(toUserInfo(user))
                    .build();

        } catch (LockedException ex) {
            // Spring Security already refused the attempt via isAccountNonLocked();
            // surface the remaining time without ever running the password check.
            throw lockedExceptionFor(username);

        } catch (DisabledException ex) {
            throw new DisabledException("This account has been deactivated. Contact your administrator.");

        } catch (BadCredentialsException ex) {
            onLoginFailure(username);
            throw ex; // GlobalExceptionHandler renders the generic "Invalid username or password"
        }
    }

    /* ── Success bookkeeping ── */
    private void onLoginSuccess(User user) {
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
    }

    /* ── Failure bookkeeping: track attempts, lock out after threshold ── */
    private void onLoginFailure(String username) {
        userRepository.findByUsername(username).ifPresent(user -> {
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);

            if (attempts >= maxFailedAttempts) {
                user.setLockedUntil(LocalDateTime.now().plusMinutes(lockoutDurationMinutes));
                user.setFailedLoginAttempts(0);
                log.warn("User '{}' locked out after {} failed login attempts", username, maxFailedAttempts);
            } else {
                log.warn("Failed login attempt {}/{} for user '{}'", attempts, maxFailedAttempts, username);
            }
            userRepository.save(user);
        });
        // Note: if the username doesn't exist at all we deliberately do nothing extra here —
        // the response is identical either way, so an attacker can't use timing/response
        // differences to enumerate valid usernames.
    }

    private AccountLockedException lockedExceptionFor(String username) {
        return userRepository.findByUsername(username)
                .map(User::getLockedUntil)
                .map(until -> {
                    long minutesLeft = Math.max(1, ChronoUnit.MINUTES.between(LocalDateTime.now(), until));
                    return new AccountLockedException(
                        "Account locked due to multiple failed login attempts. Try again after "
                            + until.format(TIME_FMT) + " (~" + minutesLeft + " min).");
                })
                .orElseGet(() -> new AccountLockedException(
                    "Account temporarily locked due to multiple failed login attempts. Please try again later."));
    }

    /* ── Get current authenticated user ── */
    public AuthDTO.UserInfo getCurrentUser() {
        String username = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
        return toUserInfo(user);
    }

    /* ── Helper ── */
    private AuthDTO.UserInfo toUserInfo(User user) {
        return AuthDTO.UserInfo.builder()
                .id(user.getId())
                .name(user.getName())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }
}
