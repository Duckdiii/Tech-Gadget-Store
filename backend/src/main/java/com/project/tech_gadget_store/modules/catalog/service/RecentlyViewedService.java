package com.project.tech_gadget_store.modules.catalog.service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class RecentlyViewedService {

    private static final String KEY_PREFIX = "recent-views:";
    private static final Duration TTL = Duration.ofDays(7);

    private final StringRedisTemplate redisTemplate; // StringRedisTemplate là một công cụ của Spring Data Redis giúp
                                                     // bạn giao tiếp với Redis Server. Ở đây, cả Key và Value lưu trong
                                                     // Redis đều ở dạng String

    public RecentlyViewedService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void recordView(String customerId, String productId) {
        String key = KEY_PREFIX + customerId; // recent-views:abc-123
        // ZADD key score member
        // Sorted Set
        // member = productId
        // score = System.currentTimeMillis()
        redisTemplate.opsForZSet().add(key, productId, System.currentTimeMillis()); // Khách xem sản phẩm B lúc 10h →
                                                                                    // set có: {A: 9h, B: 10h}
        redisTemplate.expire(key, TTL); // Set/refresh lại TTL = 7 ngày cho key này
    }

    public List<String> getRecentProductIds(String customerId, int limit) {
        // lệnh Redis ZREVRANGE key start stop
        // Lấy ra các productId trong sorted set theo thứ tự giảm dần của score (tức là
        // mới nhất → cũ nhất)
        Set<String> ids = redisTemplate.opsForZSet()
                // key: Đây là tên (định danh) của Sorted Set lưu trong cơ sở dữ liệu Redis
                // limit = 5 → lấy rank 0 đến 4, tức đúng 5 phần tử đầu
                .reverseRange(KEY_PREFIX + customerId, 0, limit - 1);
        return ids == null ? List.of() : new ArrayList<>(ids); // phòng trường hợp khách chưa từng xem sản phẩm nào
    }
}
