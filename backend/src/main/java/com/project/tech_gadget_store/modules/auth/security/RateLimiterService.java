package com.project.tech_gadget_store.modules.auth.security;

import java.time.Duration;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

/**
 * Fixed-window request counter backed by Redis ({@code INCR} + {@code EXPIRE}), shared by
 * IP-based rate limiters across the app. Redis is single-threaded, so the increment is atomic
 * without any extra locking.
 */
@Service
public class RateLimiterService {

    private final StringRedisTemplate redisTemplate;

    public RateLimiterService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public boolean tryAcquire(String key, int maxAttempts, Duration window) {
        Long count = redisTemplate.opsForValue().increment(key);
        if (count != null && count == 1) {
            redisTemplate.expire(key, window);
        }
        return count != null && count <= maxAttempts;
    }
}
