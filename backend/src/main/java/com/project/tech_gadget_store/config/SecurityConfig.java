package com.project.tech_gadget_store.config;

import com.project.tech_gadget_store.modules.auth.security.AuthRateLimitFilter;
import com.project.tech_gadget_store.modules.auth.security.JwtAuthFilter;
import com.project.tech_gadget_store.modules.auth.service.CustomUserDetailsService;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${cors.allowed-origins:http://localhost:5173}")
    private String allowedOrigins;

    private final JwtAuthFilter jwtAuthFilter;
    private final AuthRateLimitFilter authRateLimitFilter;
    private final CustomUserDetailsService userDetailsService;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter,
            AuthRateLimitFilter authRateLimitFilter,
            CustomUserDetailsService userDetailsService) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.authRateLimitFilter = authRateLimitFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) {
        try {
            return config.getAuthenticationManager();
        } catch (Exception e) {
            throw new IllegalStateException("Could not build AuthenticationManager", e);
        }
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of(allowedOrigins.split(",")));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.GET, "/api/products/for-you", "/api/products/recently-viewed",
                                "/api/products/suggestions-from-history")
                        .hasRole("CUSTOMER")
                        .requestMatchers(HttpMethod.GET, "/api/chatbot/**").hasRole("CUSTOMER")
                        .requestMatchers(HttpMethod.GET, "/api/products", "/api/products/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/uploads/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/payment/vnpay/return", "/api/payment/momo/return")
                        .permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/forgot-password").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/reset-password").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/logout").permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()
                        .requestMatchers("/actuator/health", "/actuator/health/**").permitAll()
                        // Xác thực thật diễn ra ở tầng STOMP CONNECT (xem StompAuthInterceptor),
                        // không phải ở đây — handshake HTTP nâng cấp WebSocket không mang JWT được.
                        .requestMatchers("/ws", "/ws/**").permitAll()
                        .requestMatchers("/actuator/**").hasRole("MANAGER")
                        .requestMatchers(HttpMethod.POST, "/api/payment/momo/ipn").permitAll()
                        .requestMatchers("/api/manager/warehouse-logs/**").hasAnyRole("STAFF", "MANAGER")
                        .requestMatchers("/api/manager/orders/**").hasAnyRole("STAFF", "MANAGER")
                        .requestMatchers("/api/manager/supply-orders/**").hasAnyRole("STAFF", "MANAGER")
                        .requestMatchers("/api/manager/suppliers/**").hasAnyRole("STAFF", "MANAGER")
                        .requestMatchers("/api/manager/brands/**").hasAnyRole("STAFF", "MANAGER")
                        .requestMatchers("/api/manager/categories/**").hasAnyRole("STAFF", "MANAGER")
                        .requestMatchers("/api/manager/**").hasRole("MANAGER")
                        .requestMatchers("/api/customer/**").hasRole("CUSTOMER")
                        .requestMatchers("/api/import-logs/**").hasAnyRole("STAFF", "MANAGER")
                        .requestMatchers("/api/export-logs/**").hasAnyRole("STAFF", "MANAGER")
                        .requestMatchers("/api/warehouse/low-stock-products/**").hasAnyRole("STAFF", "MANAGER")
                        .anyRequest().authenticated())
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                .addFilterBefore(authRateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthFilter, AuthRateLimitFilter.class);

        return http.build();
    }
}
