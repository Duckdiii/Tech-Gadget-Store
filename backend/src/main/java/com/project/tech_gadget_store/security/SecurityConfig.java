package com.project.tech_gadget_store.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable) // Tắt CSRF vì mình dùng JWT
                .authorizeExchange(auth -> auth
                        // Cho phép truy cập tự do vào các API đăng ký/đăng nhập và xem sản phẩm
                        .pathMatchers("/api/auth/**").permitAll()
                        .pathMatchers("/api/brands/**", "/api/products/**").permitAll()

                        // Các API quản trị bắt buộc phải có quyền ADMIN
                        .pathMatchers("/api/admin/**").hasRole("ADMIN")

                        // Các API còn lại bắt buộc phải đăng nhập (có token)
                        .anyExchange().authenticated())
                // Chèn bộ lọc JWT của mình vào TRƯỚC bộ lọc xác thực mặc định của Spring
                .addFilterAt(jwtAuthenticationFilter, SecurityWebFiltersOrder.AUTHENTICATION)
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}