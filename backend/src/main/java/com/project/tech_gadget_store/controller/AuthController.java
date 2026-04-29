package com.project.tech_gadget_store.controller;

import com.project.tech_gadget_store.dto.request.LoginRequest;
import com.project.tech_gadget_store.dto.response.LoginResponse;
import com.project.tech_gadget_store.exception.UnauthorizedException;
import com.project.tech_gadget_store.repository.AccountRepository;
import com.project.tech_gadget_store.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AccountRepository accountRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public Mono<ResponseEntity<LoginResponse>> login(@RequestBody LoginRequest request) {
        return accountRepository.findByEmail(request.getEmail())
                .filter(account -> passwordEncoder.matches(request.getPassword(), account.getPasswordHash()))
                .map(account -> {
                    String token = jwtUtil.generateToken(account.getEmail(), account.getRole().name());
                    return ResponseEntity.ok(new LoginResponse(
                            token, "Bearer", account.getEmail(), account.getRole().name()));
                })
                // Nếu sai email hoặc mật khẩu, trả về 401 Unauthorized
                .switchIfEmpty(Mono.error(new UnauthorizedException("Email hoặc mật khẩu không chính xác!")));
    }
}
