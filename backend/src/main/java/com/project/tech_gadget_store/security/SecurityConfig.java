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
                .csrf(ServerHttpSecurity.CsrfSpec::disable) // Táº¯t CSRF vÃ¬ mÃ¬nh dÃ¹ng JWT
                .authorizeExchange(auth -> auth
                        // Cho phÃ©p truy cáº­p tá»± do vÃ o cÃ¡c API Ä‘Äƒng kÃ½/Ä‘Äƒng nháº­p vÃ  xem sáº£n pháº©m
                        .pathMatchers("/api/auth/**").permitAll()
                        .pathMatchers("/api/brands/**", "/api/products/**").permitAll()

                        // CÃ¡c API quáº£n trá»‹ báº¯t buá»™c pháº£i cÃ³ quyá»n ADMIN
                        .pathMatchers("/api/admin/**").hasRole("ADMIN")

                        // CÃ¡c API cÃ²n láº¡i báº¯t buá»™c pháº£i Ä‘Äƒng nháº­p (cÃ³ token)
                        .anyExchange().authenticated())
                // ChÃ¨n bá»™ lá»c JWT cá»§a mÃ¬nh vÃ o TRÆ¯á»šC bá»™ lá»c xÃ¡c thá»±c máº·c Ä‘á»‹nh cá»§a Spring
                .addFilterAt(jwtAuthenticationFilter, SecurityWebFiltersOrder.AUTHENTICATION)
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}