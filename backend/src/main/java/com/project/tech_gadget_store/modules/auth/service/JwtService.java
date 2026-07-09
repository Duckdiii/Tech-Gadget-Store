package com.project.tech_gadget_store.modules.auth.service;

import com.project.tech_gadget_store.modules.auth.entity.InvalidatedToken;
import com.project.tech_gadget_store.modules.auth.repository.InvalidatedTokenRepository;
import com.project.tech_gadget_store.modules.auth.security.AccountUserDetails;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMs;
    private final InvalidatedTokenRepository invalidatedTokenRepository;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long expirationMs,
            InvalidatedTokenRepository invalidatedTokenRepository) {
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        this.expirationMs = expirationMs;
        this.invalidatedTokenRepository = invalidatedTokenRepository;
    }

    public String generateToken(AccountUserDetails details) {
        return Jwts.builder()
                .subject(details.getUsername())
                .claim("role", details.getRole())
                .claim("fullName", details.getFullName())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(key)
                .compact();
    }

    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return parseClaims(token).get("role", String.class);
    }

    public Date extractExpiration(String token) {
        return parseClaims(token).getExpiration();
    }

    public boolean isTokenValid(String token) {
        try {
            if (invalidatedTokenRepository.existsByToken(token)) {
                return false;
            }
            return parseClaims(token).getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    @Transactional
    public void invalidateToken(String token) {
        if (token == null || token.isBlank()) {
            return;
        }
        try {
            Date expiry = extractExpiration(token);
            LocalDateTime expiryTime = expiry.toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime();

            if (!invalidatedTokenRepository.existsByToken(token)) {
                InvalidatedToken invalidatedToken = new InvalidatedToken(token, expiryTime);
                invalidatedTokenRepository.save(invalidatedToken);
            }
        } catch (Exception e) {
            LocalDateTime defaultExpiry = LocalDateTime.now().plusHours(24);
            InvalidatedToken invalidatedToken = new InvalidatedToken(token, defaultExpiry);
            invalidatedTokenRepository.save(invalidatedToken);
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
