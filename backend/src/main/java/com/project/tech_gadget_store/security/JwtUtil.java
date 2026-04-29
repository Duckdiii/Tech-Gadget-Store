package com.project.tech_gadget_store.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${app.jwt.secret}") // Lấy chuỗi bí mật từ file application.properties để dùng làm chìa khóa ký
                                // token
    private String secret;

    @Value("${app.jwt.expiration-ms}") // Lấy thời gian hết hạn token (tính bằng milliseconds) từ file
                                       // application.properties
    private long expirationTime;

    // 1. Chuyển chuỗi Secret thành Chìa khóa (SecretKey) chuẩn của JJWT
    private SecretKey getSignKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());// Dùng thuật toán HMAC-SHA với chuỗi secret đã mã hóa thành byte
                                                     // array để tạo SecretKey
    }

    // 2. Hàm Nặn Thẻ (Tạo Token) khi User đăng nhập thành công
    public String generateToken(String email, String role) {
        return Jwts.builder()
                .subject(email)// Đặt Email của User vào phần Subject của token (đây là thông tin chính để xác
                               // định danh tính người dùng)
                .claim("role", role) // Nhét thêm quyền (USER/ADMIN) vào để sau này phân quyền
                .issuedAt(new Date()) // Thời điểm phát hành
                .expiration(new Date(System.currentTimeMillis() + expirationTime)) // Thời điểm hết hạn
                .signWith(getSignKey()) // Đóng dấu mộc bằng chìa khóa bảo mật
                .compact();
    }

    // 3. Bóc tách thông tin (Claims) từ Token do Frontend gửi lên
    public Claims extractAllClaims(String token) { // nó biến JWT string thành dữ liệu bên trong token (nếu token hợp
                                                   // lệ).
        return Jwts.parser()
                .verifyWith(getSignKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        // Ví dụ token sau khi giải mã sẽ có dạng:
        // {
        // "sub": "alice",
        // "role": "USER",
        // "iat": 1690000000,
        // "exp": 1690003600
        // }
    }

    // 4. Lấy Email từ Token
    public String getEmailFromToken(String token) {
        return extractAllClaims(token).getSubject();
    }

    // 5. Lấy Role từ Token
    public String getRoleFromToken(String token) {
        return extractAllClaims(token).get("role", String.class);
    }

    // 6. Kiểm tra xem thẻ còn hạn hay không
    public boolean isTokenValid(String token) {
        try {
            return !extractAllClaims(token).getExpiration().before(new Date());
        } catch (Exception e) {
            // Nếu token bị chỉnh sửa, làm giả, hoặc hết hạn -> parser sẽ quăng lỗi, mình
            // catch lại và trả về false
            return false;
        }
    }
}