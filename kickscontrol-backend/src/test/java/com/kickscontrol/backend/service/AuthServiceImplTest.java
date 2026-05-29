package com.kickscontrol.backend.service;

import com.kickscontrol.backend.dto.request.LoginRequest;
import com.kickscontrol.backend.dto.request.RegisterRequest;
import com.kickscontrol.backend.dto.response.AuthResponse;
import com.kickscontrol.backend.entity.User;
import com.kickscontrol.backend.entity.enums.UserRole;
import com.kickscontrol.backend.exception.BusinessException;
import com.kickscontrol.backend.repository.UserRepository;
import com.kickscontrol.backend.security.JwtUtil;
import com.kickscontrol.backend.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtUtil jwtUtil;
    @Mock AuthenticationManager authenticationManager;

    @InjectMocks AuthServiceImpl authService;

    // ─── register ───────────────────────────────────────────────────────────

    @Test
    void register_newEmail_savesUserAndReturnsToken() {
        RegisterRequest req = registerRequest("Juan", "Gil", "juan@test.com", "Password1");

        when(userRepository.existsByEmail("juan@test.com")).thenReturn(false);
        when(passwordEncoder.encode("Password1")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u = User.builder().id(1L).firstName(u.getFirstName()).lastName(u.getLastName())
                    .email(u.getEmail()).password(u.getPassword()).role(u.getRole()).build();
            return u;
        });
        when(jwtUtil.generateToken(any(User.class))).thenReturn("jwt-token");

        AuthResponse result = authService.register(req);

        assertThat(result.getEmail()).isEqualTo("juan@test.com");
        assertThat(result.getFirstName()).isEqualTo("Juan");
        assertThat(result.getToken()).isEqualTo("jwt-token");
        assertThat(result.getRole()).isEqualTo("USER");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_duplicateEmail_throwsBusinessException() {
        RegisterRequest req = registerRequest("Juan", "Gil", "dup@test.com", "Password1");
        when(userRepository.existsByEmail("dup@test.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("dup@test.com");

        verify(userRepository, never()).save(any());
    }

    // ─── login ───────────────────────────────────────────────────────────────

    @Test
    void login_validCredentials_returnsAuthResponse() {
        LoginRequest req = loginRequest("juan@test.com", "Password1");
        User user = savedUser(1L, "juan@test.com");

        when(userRepository.findByEmail("juan@test.com")).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken(user)).thenReturn("jwt-token");

        AuthResponse result = authService.login(req);

        assertThat(result.getEmail()).isEqualTo("juan@test.com");
        assertThat(result.getToken()).isEqualTo("jwt-token");
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void login_badCredentials_propagatesBadCredentialsException() {
        LoginRequest req = loginRequest("juan@test.com", "wrong");
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(BadCredentialsException.class);
    }

    // ─── helpers ─────────────────────────────────────────────────────────────

    private RegisterRequest registerRequest(String first, String last, String email, String pass) {
        RegisterRequest r = new RegisterRequest();
        r.setFirstName(first);
        r.setLastName(last);
        r.setEmail(email);
        r.setPassword(pass);
        return r;
    }

    private LoginRequest loginRequest(String email, String pass) {
        LoginRequest r = new LoginRequest();
        r.setEmail(email);
        r.setPassword(pass);
        return r;
    }

    private User savedUser(Long id, String email) {
        return User.builder().id(id).email(email).firstName("Juan").lastName("Gil")
                .password("hashed").role(UserRole.USER).build();
    }
}
