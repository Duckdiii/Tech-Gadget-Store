package com.project.tech_gadget_store.modules.auth.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Blocks spam/brute-force on the public, unauthenticated {@code /api/auth/*}
 * endpoints.
 * Allows a per-path attempt limit per IP within a per-path window; on breach,
 * returns 429.
 * Counters live in Redis (see {@link RateLimiterService}) so they survive app
 * restarts and
 * are shared across backend instances.
 */
@Component
public class AuthRateLimitFilter extends OncePerRequestFilter {

    private record Rule(int maxAttempts, Duration window) {
    }

    private static final Map<String, Rule> RULES = Map.of(// Bảng luật riêng cho từng endpoint
            "/api/auth/login", new Rule(5, Duration.ofMinutes(15)),
            "/api/auth/register", new Rule(5, Duration.ofMinutes(15)),
            "/api/auth/forgot-password", new Rule(3, Duration.ofMinutes(15)),
            "/api/auth/reset-password", new Rule(5, Duration.ofMinutes(15)));

    private final RateLimiterService rateLimiterService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AuthRateLimitFilter(RateLimiterService rateLimiterService) {
        this.rateLimiterService = rateLimiterService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !("POST".equalsIgnoreCase(request.getMethod())
                && RULES.containsKey(request.getServletPath()));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getServletPath(); // Lấy path hiện tại
        Rule rule = RULES.get(path); // tra ra rule tương ứng trong RULES
        String ip = resolveClientIp(request); // Lấy IP người gọi
        String key = "rate-limit:" + path + ":" + ip; // ví dụ: rate-limit:/api/auth/login:1.2.3.4

        if (!rateLimiterService.tryAcquire(key, rule.maxAttempts(), rule.window())) { // gọi duy nhất tới
                                                                                      // RateLimiterService
            rejectRequest(response); // trả JSON 429
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
                "message", "Too many requests. Please try again later."));
        response.getWriter().write(body);
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            String first = forwarded.split(",")[0].trim();
            if (!first.isEmpty())
                return first;
        }
        return request.getRemoteAddr();
    }
}
