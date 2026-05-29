package com.kickscontrol.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kickscontrol.backend.dto.request.LoginRequest;
import com.kickscontrol.backend.dto.request.RegisterRequest;
import com.kickscontrol.backend.dto.response.AuthResponse;
import com.kickscontrol.backend.exception.BusinessException;
import com.kickscontrol.backend.security.JwtAuthenticationFilter;
import com.kickscontrol.backend.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockBean AuthService authService;
    @MockBean JwtAuthenticationFilter jwtAuthenticationFilter;
    @MockBean UserDetailsService userDetailsService;

    private static final AuthResponse AUTH_RESPONSE = AuthResponse.builder()
            .token("jwt-token")
            .email("juan@test.com")
            .firstName("Juan")
            .lastName("Gil")
            .role("USER")
            .build();

    // ─── POST /api/auth/register ──────────────────────────────────────────────

    @Test
    void register_validRequest_returns201WithToken() throws Exception {
        when(authService.register(any())).thenReturn(AUTH_RESPONSE);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRegisterRequest())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").value("jwt-token"))
                .andExpect(jsonPath("$.data.email").value("juan@test.com"))
                .andExpect(jsonPath("$.data.role").value("USER"));
    }

    @Test
    void register_blankFirstName_returns400() throws Exception {
        RegisterRequest req = validRegisterRequest();
        req.setFirstName("");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void register_invalidEmailFormat_returns400() throws Exception {
        RegisterRequest req = validRegisterRequest();
        req.setEmail("not-an-email");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void register_passwordTooShort_returns400() throws Exception {
        RegisterRequest req = validRegisterRequest();
        req.setPassword("short");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void register_duplicateEmail_returns400() throws Exception {
        when(authService.register(any())).thenThrow(new BusinessException("Email already registered: juan@test.com"));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRegisterRequest())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Email already registered: juan@test.com"));
    }

    // ─── POST /api/auth/login ─────────────────────────────────────────────────

    @Test
    void login_validCredentials_returns200WithToken() throws Exception {
        when(authService.login(any())).thenReturn(AUTH_RESPONSE);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest("juan@test.com", "Password1"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").value("jwt-token"));
    }

    @Test
    void login_badCredentials_returns401() throws Exception {
        when(authService.login(any())).thenThrow(new BadCredentialsException("Bad credentials"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest("juan@test.com", "wrong"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void login_blankEmail_returns400() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest("", "Password1"))))
                .andExpect(status().isBadRequest());
    }

    // ─── helpers ─────────────────────────────────────────────────────────────

    private RegisterRequest validRegisterRequest() {
        RegisterRequest r = new RegisterRequest();
        r.setFirstName("Juan");
        r.setLastName("Gil");
        r.setEmail("juan@test.com");
        r.setPassword("Password1");
        return r;
    }

    private LoginRequest loginRequest(String email, String pass) {
        LoginRequest r = new LoginRequest();
        r.setEmail(email);
        r.setPassword(pass);
        return r;
    }
}
