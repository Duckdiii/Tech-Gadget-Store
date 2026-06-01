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

    @Value("${app.jwt.secret}") // Láº¥y chuá»—i bÃ­ máº­t tá»« file application.properties Ä‘á»ƒ dÃ¹ng lÃ m chÃ¬a khÃ³a kÃ½
                                // token
    private String secret;

    @Value("${app.jwt.expiration-ms}") // Láº¥y thá»i gian háº¿t háº¡n token (tÃ­nh báº±ng milliseconds) tá»« file
                                       // application.properties
    private long expirationTime;

    // 1. Chuyá»ƒn chuá»—i Secret thÃ nh ChÃ¬a khÃ³a (SecretKey) chuáº©n cá»§a JJWT
    private SecretKey getSignKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());// DÃ¹ng thuáº­t toÃ¡n HMAC-SHA vá»›i chuá»—i secret Ä‘Ã£ mÃ£ hÃ³a thÃ nh byte
                                                     // array Ä‘á»ƒ táº¡o SecretKey
    }

    // 2. HÃ m Náº·n Tháº» (Táº¡o Token) khi User Ä‘Äƒng nháº­p thÃ nh cÃ´ng
    public String generateToken(String email, String role) {
        return Jwts.builder()
                .subject(email)// Äáº·t Email cá»§a User vÃ o pháº§n Subject cá»§a token (Ä‘Ã¢y lÃ  thÃ´ng tin chÃ­nh Ä‘á»ƒ xÃ¡c
                               // Ä‘á»‹nh danh tÃ­nh ngÆ°á»i dÃ¹ng)
                .claim("role", role) // NhÃ©t thÃªm quyá»n (USER/ADMIN) vÃ o Ä‘á»ƒ sau nÃ y phÃ¢n quyá»n
                .issuedAt(new Date()) // Thá»i Ä‘iá»ƒm phÃ¡t hÃ nh
                .expiration(new Date(System.currentTimeMillis() + expirationTime)) // Thá»i Ä‘iá»ƒm háº¿t háº¡n
                .signWith(getSignKey()) // ÄÃ³ng dáº¥u má»™c báº±ng chÃ¬a khÃ³a báº£o máº­t
                .compact();
    }

    // 3. BÃ³c tÃ¡ch thÃ´ng tin (Claims) tá»« Token do Frontend gá»­i lÃªn
    public Claims extractAllClaims(String token) { // nÃ³ biáº¿n JWT string thÃ nh dá»¯ liá»‡u bÃªn trong token (náº¿u token há»£p
                                                   // lá»‡).
        return Jwts.parser()
                .verifyWith(getSignKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        // VÃ­ dá»¥ token sau khi giáº£i mÃ£ sáº½ cÃ³ dáº¡ng:
        // {
        // "sub": "alice",
        // "role": "USER",
        // "iat": 1690000000,
        // "exp": 1690003600
        // }
    }

    // 4. Láº¥y Email tá»« Token
    public String getEmailFromToken(String token) {
        return extractAllClaims(token).getSubject();
    }

    // 5. Láº¥y Role tá»« Token
    public String getRoleFromToken(String token) {
        return extractAllClaims(token).get("role", String.class);
    }

    // 6. Kiá»ƒm tra xem tháº» cÃ²n háº¡n hay khÃ´ng
    public boolean isTokenValid(String token) {
        try {
            return !extractAllClaims(token).getExpiration().before(new Date());
        } catch (Exception e) {
            // Náº¿u token bá»‹ chá»‰nh sá»­a, lÃ m giáº£, hoáº·c háº¿t háº¡n -> parser sáº½ quÄƒng lá»—i, mÃ¬nh
            // catch láº¡i vÃ  tráº£ vá» false
            return false;
        }
    }
}