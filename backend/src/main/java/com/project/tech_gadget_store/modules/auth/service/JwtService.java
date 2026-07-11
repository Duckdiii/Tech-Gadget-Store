package com.project.tech_gadget_store.modules.auth.service;

import com.project.tech_gadget_store.modules.auth.security.AccountUserDetails;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;



@Service
public class JwtService {

    private static final String BLACKLIST_PREFIX = "jwt-blacklist:";

    private final SecretKey key;
    private final long expirationMs;
    private final StringRedisTemplate redisTemplate;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long expirationMs,
            StringRedisTemplate redisTemplate) {
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        this.expirationMs = expirationMs;
        this.redisTemplate = redisTemplate;
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
            if (Boolean.TRUE.equals(redisTemplate.hasKey(BLACKLIST_PREFIX + token))) {
                return false;
            }
            return parseClaims(token).getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Blacklists a token for exactly the time it has left before its own {@code exp} claim
     * would invalidate it anyway — the Redis key expires itself, so there's no separate cleanup
     * job to maintain.
     */
    public void invalidateToken(String token) {
        if (token == null || token.isBlank()) {
            return;
        }
        String key = BLACKLIST_PREFIX + token;
        try {
            Duration ttl = Duration.between(Instant.now(), extractExpiration(token).toInstant());
            if (ttl.isPositive()) {
                redisTemplate.opsForValue().set(key, "1", ttl);
            }
        } catch (Exception e) {
            redisTemplate.opsForValue().set(key, "1", Duration.ofHours(24));
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
