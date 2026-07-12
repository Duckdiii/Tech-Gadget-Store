package com.project.tech_gadget_store.modules.catalog.service;

import java.time.Duration;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class ProductViewerTrackerService {

    private static final String KEY_PREFIX = "product-viewers:";
    private static final Duration ACTIVE_WINDOW = Duration.ofSeconds(60);
    private static final Duration KEY_TTL = Duration.ofMinutes(5);

    private final StringRedisTemplate redisTemplate;

    public ProductViewerTrackerService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public long recordViewerAndCount(String productId, String visitorId) {
        String key = KEY_PREFIX + productId; // product-viewers:12345
        long now = System.currentTimeMillis(); // Lấy thời gian hiện tại tính bằng mili-giây kể từ epoch (1/1/1970)

        redisTemplate.opsForZSet().add(key, visitorId, now); // Ghi vào Sorted Set trong Redis với:
        // key: product-viewers:12345
        // member: visitorId (ví dụ: abc-123)
        // score: now (thời gian hiện tại tính bằng mili-giây)
        redisTemplate.opsForZSet().removeRangeByScore(key, 0, now - ACTIVE_WINDOW.toMillis());// Xóa các visitorId đã
                                                                                              // xem sản phẩm này trước
                                                                                              // thời điểm ACTIVE_WINDOW
                                                                                              // (60 giây) trước thời
                                                                                              // điểm hiện tại
        redisTemplate.expire(key, KEY_TTL);// Set/refresh lại TTL = 5 phút cho key này

        Long count = redisTemplate.opsForZSet().zCard(key);// Lấy số lượng các visitorId còn lại trong Sorted Set, tức
                                                           // là số lượng người đang xem sản phẩm này trong vòng
                                                           // ACTIVE_WINDOW (60 giây) gần đây
        return count == null ? 0 : count; // Nếu count == null (tức là key không tồn tại trong Redis), trả về 0, ngược
                                          // lại trả về count
    }
}
