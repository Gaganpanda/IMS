package com.ims.controller;

import com.ims.dto.ApiResponse;
import com.ims.dto.AuthDTO;
import com.ims.security.LoginRateLimiter;
import com.ims.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Login and user info endpoints")
public class AuthController {

    private final AuthService authService;
    private final LoginRateLimiter rateLimiter;

    @PostMapping("/login")
    @Operation(summary = "Login and receive JWT token")
    public ResponseEntity<ApiResponse<AuthDTO.LoginResponse>> login(
            @Valid @RequestBody AuthDTO.LoginRequest request,
            HttpServletRequest httpRequest) {
        String clientIp = resolveClientIp(httpRequest);
        rateLimiter.checkAllowed(clientIp);

        AuthDTO.LoginResponse response = authService.login(request);

        rateLimiter.reset(clientIp);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout (client should discard token)")
    public ResponseEntity<ApiResponse<Void>> logout() {
        // Stateless JWT — client discards the token
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }

    @GetMapping("/me")
    @Operation(summary = "Get currently authenticated user")
    public ResponseEntity<ApiResponse<AuthDTO.UserInfo>> getCurrentUser() {
        return ResponseEntity.ok(ApiResponse.success(authService.getCurrentUser()));
    }

    /** Honours a load-balancer / reverse-proxy's X-Forwarded-For header, falling back to the raw remote address. */
    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
