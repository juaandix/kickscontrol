package com.kickscontrol.backend.service.impl;

import com.kickscontrol.backend.dto.request.LoginRequest;
import com.kickscontrol.backend.dto.request.RefreshRequest;
import com.kickscontrol.backend.dto.request.RegisterRequest;
import com.kickscontrol.backend.dto.response.AuthResponse;
import com.kickscontrol.backend.entity.User;
import com.kickscontrol.backend.entity.enums.UserRole;
import com.kickscontrol.backend.exception.BusinessException;
import com.kickscontrol.backend.repository.UserRepository;
import com.kickscontrol.backend.security.JwtUtil;
import com.kickscontrol.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email already registered: " + request.getEmail());
        }
        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.USER)
                .build();
        userRepository.save(user);
        return buildAuthResponse(user);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException("User not found"));
        return buildAuthResponse(user);
    }

    @Override
    public AuthResponse refresh(RefreshRequest request) {
        String refreshToken = request.getRefreshToken();

        if (!jwtUtil.isRefreshToken(refreshToken)) {
            throw new BusinessException("Invalid refresh token");
        }

        String email;
        try {
            email = jwtUtil.extractEmail(refreshToken);
        } catch (io.jsonwebtoken.JwtException e) {
            throw new BusinessException("Refresh token expired or invalid");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("User not found"));

        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        return AuthResponse.builder()
                .token(jwtUtil.generateToken(user))
                .refreshToken(jwtUtil.generateRefreshToken(user))
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().name())
                .build();
    }
}
