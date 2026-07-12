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

    private final SecretKey key; // Khóa bí mật (Secret Key) dùng cho thuật toán mã hóa đối xứng
    private final long expirationMs; // Thời gian hết hạn mặc định của một JWT, tính bằng đơn vị mili-giây
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
                .issuedAt(new Date()) // thời điểm phát hành token
                .expiration(new Date(System.currentTimeMillis() + expirationMs)) // thời điểm hết hạn token
                .signWith(key) // ký token bằng khóa bí mật (Secret Key) với thuật toán HMAC-SHA
                .compact(); // tạo ra chuỗi JWT hoàn chỉnh (Header + Payload + Signature) dưới dạng String
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

    public boolean isTokenValid(String token) { // kiểm tra xem một JWT (JSON Web Token) có còn hợp lệ hay không
        try {
            // Kiểm tra xem token này có nằm trong danh sách các token đã bị hủy bỏ (ví dụ:
            // người dùng đã bấm Đăng xuất) hay không
            if (Boolean.TRUE.equals(redisTemplate.hasKey(BLACKLIST_PREFIX + token))) {
                return false;
            }
            // Kiểm tra xem token đã quá hạn sử dụng hay chưa
            // parseClaims(token): Giải mã token để lấy thông tin Payload
            // getExpiration(): Lấy thông tin thời điểm hết hạn (exp claim) từ Payload
            // after(new Date()): So sánh thời điểm hết hạn với thời điểm hiện tại
            return parseClaims(token).getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    // vô hiệu hóa (đưa vào danh sách đen - Blacklist) một token JWT
    public void invalidateToken(String token) {
        if (token == null || token.isBlank()) {
            return;
        }
        String key = BLACKLIST_PREFIX + token;
        try {
            // Tính toán thời gian còn lại trước khi token hết hạn
            // Tính toán khoảng thời gian chênh lệch
            Duration ttl = Duration.between(Instant.now(), extractExpiration(token).toInstant());
            if (ttl.isPositive()) { // Kiểm tra xem khoảng thời gian còn lại có lớn hơn 0 hay không
                // Ghi key vào Redis với giá trị là "1" (chỉ là giá trị tượng trưng để đánh dấu)
                // kèm theo thời gian sống (TTL) đúng bằng khoảng thời gian còn lại ttl
                redisTemplate.opsForValue().set(key, "1", ttl);
            }
        } catch (Exception e) {
            // Nếu có lỗi xảy ra (ví dụ: token không hợp lệ, không thể giải mã, hoặc token
            // đã hết hạn),
            // thì vẫn ghi key vào Redis với giá trị là "1" và thời gian sống mặc định là 24
            // giờ.
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
