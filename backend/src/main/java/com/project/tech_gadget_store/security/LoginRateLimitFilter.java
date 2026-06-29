package com.project.tech_gadget_store.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;

/**
 * Blocks brute-force attacks on POST /api/auth/login.
 * Allows MAX_ATTEMPTS per IP within the WINDOW. On breach, returns 429.
 * Uses Redis INCR + EXPIRE so the counter is atomic and survives restarts.
 */
@Component
public class LoginRateLimitFilter extends OncePerRequestFilter {

    private static final String LOGIN_PATH = "/api/auth/login";
    private static final int MAX_ATTEMPTS = 5;
    private static final Duration WINDOW = Duration.ofMinutes(15);
    private static final String KEY_PREFIX = "rl:login:";

    private final StringRedisTemplate redis;
    private final ObjectMapper objectMapper;

    public LoginRateLimitFilter(StringRedisTemplate redis, ObjectMapper objectMapper) {
        this.redis = redis;
        this.objectMapper = objectMapper;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !("POST".equalsIgnoreCase(request.getMethod())
                && LOGIN_PATH.equals(request.getServletPath()));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String ip = resolveClientIp(request);
        String key = KEY_PREFIX + ip;

        Long attempts = redis.opsForValue().increment(key);
        if (attempts == null) attempts = 1L;

        if (attempts == 1) {
            // First attempt in window — set the expiry
            redis.expire(key, WINDOW);
        }

        if (attempts > MAX_ATTEMPTS) {
            rejectRequest(response);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private void rejectRequest(HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        String body = objectMapper.writeValueAsString(Map.of(
                "status", 429,
                "error", "Too Many Requests",
                "message", "Too many login attempts. Please try again after 15 minutes."));
        response.getWriter().write(body);
    }

    /**
     * Extracts the real client IP.
     * Trusts X-Forwarded-For only for the first (leftmost) value, which is the
     * original client IP when the app sits behind a reverse proxy.
     */
    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            // Take only the first IP to prevent header injection
            String first = forwarded.split(",")[0].trim();
            if (!first.isEmpty()) return first;
        }
        return request.getRemoteAddr();
    }
}
