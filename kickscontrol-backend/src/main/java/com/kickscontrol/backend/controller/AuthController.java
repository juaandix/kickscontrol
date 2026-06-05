package com.kickscontrol.backend.controller;

import com.kickscontrol.backend.dto.request.LoginRequest;
import com.kickscontrol.backend.dto.request.RefreshRequest;
import com.kickscontrol.backend.dto.request.RegisterRequest;
import com.kickscontrol.backend.dto.response.ApiResponse;
import com.kickscontrol.backend.dto.response.AuthResponse;
import com.kickscontrol.backend.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Register, login and token refresh endpoints")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("User registered successfully", authService.register(request)));
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and return access + refresh tokens")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Login successful", authService.login(request)));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Issue new access token using a valid refresh token")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Token refreshed", authService.refresh(request)));
    }
}
