package com.project.tech_gadget_store.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Blocks brute-force attacks on POST /api/auth/login.
 * Allows MAX_ATTEMPTS per IP within the WINDOW. On breach, returns 429.
 * Uses an in-memory ConcurrentHashMap; state resets on app restart.
 */
@Component
public class LoginRateLimitFilter extends OncePerRequestFilter {

    private static final String LOGIN_PATH = "/api/auth/login";
    private static final int MAX_ATTEMPTS = 5;
    private static final long WINDOW_MS = 15 * 60 * 1000L;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // ip -> [attemptCount, windowStartMs]
    private final ConcurrentHashMap<String, long[]> attempts = new ConcurrentHashMap<>();

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
        long now = System.currentTimeMillis();

        long[] bucket = attempts.compute(ip, (k, v) -> {
            if (v == null || now - v[1] >= WINDOW_MS) {
                return new long[]{1, now};
            }
            v[0]++;
            return v;
        });

        if (bucket[0] > MAX_ATTEMPTS) {
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

    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            String first = forwarded.split(",")[0].trim();
            if (!first.isEmpty()) return first;
        }
        return request.getRemoteAddr();
    }
}
