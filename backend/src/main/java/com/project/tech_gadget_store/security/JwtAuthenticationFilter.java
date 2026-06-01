package com.project.tech_gadget_store.security;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter implements WebFilter {

    private final JwtUtil jwtUtil;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        // 1. Láº¥y header Authorization tá»« request
        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        // 2. Kiá»ƒm tra xem cÃ³ Token dáº¡ng "Bearer <token>" hay khÃ´ng
        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            // 3. Náº¿u token há»£p lá»‡, trÃ­ch xuáº¥t thÃ´ng tin vÃ  thiáº¿t láº­p Security Context
            if (jwtUtil.isTokenValid(token)) {
                String email = jwtUtil.getEmailFromToken(token);
                String role = jwtUtil.getRoleFromToken(token);

                // Táº¡o Ä‘á»‘i tÆ°á»£ng xÃ¡c thá»±c (ThÃªm tiá»n tá»‘ ROLE_ Ä‘á»ƒ Spring Security nháº­n diá»‡n Ä‘Ãºng)
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        email, null, List.of(new SimpleGrantedAuthority("ROLE_" + role)));

                // LÆ°u Ä‘á»‘i tÆ°á»£ng xÃ¡c thá»±c vÃ o Context cá»§a WebFlux
                return chain.filter(exchange)
                        .contextWrite(ReactiveSecurityContextHolder.withAuthentication(authentication));
            }
        }

        // 4. Náº¿u khÃ´ng cÃ³ token hoáº·c token sai, cá»© cho Ä‘i tiáº¿p (HÃ ng rÃ o SecurityConfig
        // á»Ÿ bÆ°á»›c sau sáº½ cháº·n láº¡i)
        return chain.filter(exchange);
    }
}