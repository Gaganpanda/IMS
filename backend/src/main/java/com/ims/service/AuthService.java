package com.ims.service;

import com.ims.dto.AuthDTO;
import com.ims.model.User;
import com.ims.repository.UserRepository;
import com.ims.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository        userRepository;
    private final JwtUtil               jwtUtil;
    private final PasswordEncoder       passwordEncoder;

    /* ── Login ── */
    public AuthDTO.LoginResponse login(AuthDTO.LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getUsername(), request.getPassword())
        );

        User user  = (User) auth.getPrincipal();
        String jwt = jwtUtil.generateToken(user);

        log.info("User '{}' logged in successfully", user.getUsername());

        return AuthDTO.LoginResponse.builder()
                .token(jwt)
                .tokenType("Bearer")
                .user(toUserInfo(user))
                .build();
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
                .build();
    }
}
