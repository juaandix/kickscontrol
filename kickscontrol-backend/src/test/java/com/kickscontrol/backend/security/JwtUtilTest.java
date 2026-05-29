package com.kickscontrol.backend.security;

import com.kickscontrol.backend.entity.User;
import com.kickscontrol.backend.entity.enums.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtUtilTest {

    private static final String SECRET = "test-secret-key-minimum-32-chars-for-hmac!!";
    private static final long EXPIRATION_MS = 86_400_000L;

    private JwtUtil jwtUtil;

    private User user;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", SECRET);
        ReflectionTestUtils.setField(jwtUtil, "expirationMs", EXPIRATION_MS);

        user = User.builder()
                .id(1L)
                .email("juan@kickscontrol.com")
                .password("encoded")
                .firstName("Juan")
                .lastName("Gil")
                .role(UserRole.USER)
                .build();
    }

    @Test
    void generateToken_returnsNonBlankJwt() {
        String token = jwtUtil.generateToken(user);

        assertThat(token).isNotBlank();
        assertThat(token.split("\\.")).hasSize(3); // header.payload.signature
    }

    @Test
    void extractEmail_returnsCorrectEmail() {
        String token = jwtUtil.generateToken(user);

        assertThat(jwtUtil.extractEmail(token)).isEqualTo(user.getEmail());
    }

    @Test
    void extractAllClaims_containsUserIdAndRole() {
        String token = jwtUtil.generateToken(user);

        var claims = jwtUtil.extractAllClaims(token);
        assertThat(claims.get("userId", Long.class)).isEqualTo(1L);
        assertThat(claims.get("role", String.class)).isEqualTo("USER");
    }

    @Test
    void isTokenValid_validTokenAndMatchingEmail_returnsTrue() {
        String token = jwtUtil.generateToken(user);

        assertThat(jwtUtil.isTokenValid(token, user.getEmail())).isTrue();
    }

    @Test
    void isTokenValid_wrongEmail_returnsFalse() {
        String token = jwtUtil.generateToken(user);

        assertThat(jwtUtil.isTokenValid(token, "other@kickscontrol.com")).isFalse();
    }

    @Test
    void isTokenValid_expiredToken_returnsFalse() {
        ReflectionTestUtils.setField(jwtUtil, "expirationMs", -1000L);
        String expiredToken = jwtUtil.generateToken(user);

        assertThat(jwtUtil.isTokenValid(expiredToken, user.getEmail())).isFalse();
    }

    @Test
    void extractAllClaims_invalidToken_throwsException() {
        assertThatThrownBy(() -> jwtUtil.extractAllClaims("not.a.valid.token"))
                .isInstanceOf(Exception.class);
    }
}
