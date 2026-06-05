package com.kickscontrol.backend.security;

import com.kickscontrol.backend.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    private static final String TOKEN_TYPE_CLAIM = "type";
    private static final String TYPE_ACCESS  = "access";
    private static final String TYPE_REFRESH = "refresh";

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration-ms}")
    private long expirationMs;

    @Value("${app.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(User user) {
        return buildToken(user, expirationMs, TYPE_ACCESS);
    }

    public String generateRefreshToken(User user) {
        return buildToken(user, refreshExpirationMs, TYPE_REFRESH);
    }

    private String buildToken(User user, long ttl, String type) {
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("userId", user.getId())
                .claim("role", user.getRole().name())
                .claim(TOKEN_TYPE_CLAIM, type)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + ttl))
                .signWith(getSigningKey())
                .compact();
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    public boolean isRefreshToken(String token) {
        try {
            return TYPE_REFRESH.equals(extractAllClaims(token).get(TOKEN_TYPE_CLAIM, String.class));
        } catch (io.jsonwebtoken.JwtException e) {
            return false;
        }
    }

    public boolean isTokenValid(String token, String email) {
        try {
            Claims claims = extractAllClaims(token);
            // Refresh tokens must not be used as access tokens
            if (TYPE_REFRESH.equals(claims.get(TOKEN_TYPE_CLAIM, String.class))) return false;
            return claims.getSubject().equals(email) && !claims.getExpiration().before(new Date());
        } catch (io.jsonwebtoken.JwtException e) {
            return false;
        }
    }
}
