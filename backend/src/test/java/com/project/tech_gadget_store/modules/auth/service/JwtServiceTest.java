package com.project.tech_gadget_store.modules.auth.service;

import com.project.tech_gadget_store.modules.auth.security.AccountUserDetails;
import java.time.Duration;
import java.util.Base64;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtServiceTest {

    private static final String SECRET =
            Base64.getEncoder().encodeToString("test-secret-key-for-jwt-unit-tests-only".getBytes());
    private static final long EXPIRATION_MS = 3_600_000L;

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    private JwtService newJwtService() {
        return new JwtService(SECRET, EXPIRATION_MS, redisTemplate);
    }

    private AccountUserDetails details(String email, String role, String fullName) {
        AccountUserDetails details = mock(AccountUserDetails.class);
        when(details.getUsername()).thenReturn(email);
        when(details.getRole()).thenReturn(role);
        when(details.getFullName()).thenReturn(fullName);
        return details;
    }

    @Test
    void generateToken_thenExtractEmail_returnsSameEmail() {
        JwtService jwtService = newJwtService();
        String token = jwtService.generateToken(details("customer@techstore.vn", "CUSTOMER", "Nguyen Van A"));

        assertThat(jwtService.extractEmail(token)).isEqualTo("customer@techstore.vn");
    }

    @Test
    void generateToken_thenExtractRole_returnsSameRole() {
        JwtService jwtService = newJwtService();
        String token = jwtService.generateToken(details("staff@techstore.vn", "STAFF", "Nguyen Van B"));

        assertThat(jwtService.extractRole(token)).isEqualTo("STAFF");
    }

    @Test
    void isTokenValid_freshUnblacklistedToken_returnsTrue() {
        JwtService jwtService = newJwtService();
        String token = jwtService.generateToken(details("customer@techstore.vn", "CUSTOMER", "Nguyen Van A"));
        when(redisTemplate.hasKey(anyString())).thenReturn(false);

        assertThat(jwtService.isTokenValid(token)).isTrue();
    }

    @Test
    void isTokenValid_blacklistedToken_returnsFalse() {
        JwtService jwtService = newJwtService();
        String token = jwtService.generateToken(details("customer@techstore.vn", "CUSTOMER", "Nguyen Van A"));
        when(redisTemplate.hasKey("jwt-blacklist:" + token)).thenReturn(true);

        assertThat(jwtService.isTokenValid(token)).isFalse();
    }

    @Test
    void isTokenValid_malformedToken_returnsFalseInsteadOfThrowing() {
        JwtService jwtService = newJwtService();
        when(redisTemplate.hasKey(anyString())).thenReturn(false);

        assertThat(jwtService.isTokenValid("not-a-real-jwt")).isFalse();
    }

    @Test
    void invalidateToken_blank_doesNothing() {
        JwtService jwtService = newJwtService();

        jwtService.invalidateToken("");
        jwtService.invalidateToken(null);

        verifyNoInteractions(redisTemplate);
    }

    @Test
    void invalidateToken_validToken_blacklistsInRedisWithRemainingTtl() {
        JwtService jwtService = newJwtService();
        String token = jwtService.generateToken(details("customer@techstore.vn", "CUSTOMER", "Nguyen Van A"));
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        jwtService.invalidateToken(token);

        verify(valueOperations).set(eq("jwt-blacklist:" + token), eq("1"), any(Duration.class));
    }
}
