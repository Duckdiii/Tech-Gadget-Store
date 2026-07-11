package com.project.tech_gadget_store.modules.catalog.service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

/**
 * Tracks each customer's recently-viewed products in a Redis sorted set (member = productId,
 * score = view timestamp) instead of a permanent DB table — the list is meant to be ephemeral
 * and disappear after a period of inactivity, and re-viewing a product should just move it to
 * the front rather than duplicate it, both of which a sorted set gives for free.
 */
@Service
public class RecentlyViewedService {

    private static final String KEY_PREFIX = "recent-views:";
    private static final Duration TTL = Duration.ofDays(7);

    private final StringRedisTemplate redisTemplate;

    public RecentlyViewedService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void recordView(String customerId, String productId) {
        String key = KEY_PREFIX + customerId;
        redisTemplate.opsForZSet().add(key, productId, System.currentTimeMillis());
        redisTemplate.expire(key, TTL);
    }

    /** Most-recently-viewed distinct product ids first, up to {@code limit}. */
    public List<String> getRecentProductIds(String customerId, int limit) {
        Set<String> ids = redisTemplate.opsForZSet()
                .reverseRange(KEY_PREFIX + customerId, 0, limit - 1);
        return ids == null ? List.of() : new ArrayList<>(ids);
    }
}
