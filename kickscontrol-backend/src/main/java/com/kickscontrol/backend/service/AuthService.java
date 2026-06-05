package com.kickscontrol.backend.service;

import com.kickscontrol.backend.dto.request.LoginRequest;
import com.kickscontrol.backend.dto.request.RegisterRequest;
import com.kickscontrol.backend.dto.request.RefreshRequest;
import com.kickscontrol.backend.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refresh(RefreshRequest request);
}
