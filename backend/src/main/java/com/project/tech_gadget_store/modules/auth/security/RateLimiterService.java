package com.project.tech_gadget_store.modules.auth.security;

import java.time.Duration;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

/**
 * Fixed-window request counter backed by Redis ({@code INCR} + {@code EXPIRE}),
 * shared by
 * IP-based rate limiters across the app. Redis is single-threaded, so the
 * increment is atomic
 * without any extra locking.
 */
@Service
public class RateLimiterService {

    private final StringRedisTemplate redisTemplate; // StringRedisTemplate là một công cụ của Spring Data Redis giúp
                                                     // bạn giao tiếp với Redis Server. Ở đây, cả Key và Value lưu trong
                                                     // Redis đều ở dạng String

    public RateLimiterService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    // key: Định danh của đối tượng cần giới hạn (ví dụ: Địa chỉ IP của user, User
    // ID, hoặc API endpoint).
    // maxAttempts: Số lần cấu hình tối đa được phép request (ví dụ: 10 lần).
    // window: Khoảng thời gian giới hạn (ví dụ: 1 phút).
    public boolean tryAcquire(String key, int maxAttempts, Duration window) {
        // Nếu key chưa từng tồn tại, Redis sẽ tự khởi tạo nó bằng 0, cộng thêm 1 rồi
        // trả về 1
        // atomic operation: INCR key
        Long count = redisTemplate.opsForValue().increment(key); // Gọi lệnh INCR trong Redis để tăng giá trị của key
                                                                 // lên 1

        if (count != null && count == 1) { // Nếu count == 1, điều này chứng tỏ đây là request đầu tiên của user trong
                                           // chu kỳ mới (hoặc key này vừa được tạo mới hoàn toàn).
            redisTemplate.expire(key, window); // hệ thống sẽ đặt thời gian hết hạn (TTL - Time To Live) cho key này
                                               // bằng giá trị window
        }
        // true: Nếu số lần request hiện tại (count) vẫn nhỏ hơn hoặc bằng giới hạn cho
        // phép (maxAttempts). Request được đi tiếp.
        // false: Nếu số lần request hiện tại (count) vượt quá giới hạn cho phép
        // (maxAttempts). Request bị chặn.
        return count != null && count <= maxAttempts;
    }
}
