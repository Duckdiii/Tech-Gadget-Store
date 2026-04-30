package com.project.tech_gadget_store.service.impl;

import com.project.tech_gadget_store.dto.request.LoginRequest;
import com.project.tech_gadget_store.dto.request.RegisterRequest;
import com.project.tech_gadget_store.dto.response.LoginResponse;
import com.project.tech_gadget_store.dto.response.RegisterResponse;
import com.project.tech_gadget_store.entity.Account;
import com.project.tech_gadget_store.entity.enums.AccountRole;
import com.project.tech_gadget_store.exception.ConflictException;
import com.project.tech_gadget_store.exception.UnauthorizedException;
import com.project.tech_gadget_store.repository.AccountRepository;
import com.project.tech_gadget_store.security.JwtUtil;
import com.project.tech_gadget_store.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Mono;

import java.time.OffsetDateTime;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccountServerImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public Mono<LoginResponse> login(LoginRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());

        return accountRepository.findByEmail(normalizedEmail)
                .filter(account -> Boolean.TRUE.equals(account.getIsActive())) // Chỉ cho phép đăng nhập nếu tài khoản
                                                                               // đang hoạt động
                .filter(account -> passwordEncoder.matches(request.getPassword(), account.getPasswordHash())) // Kiểm
                                                                                                              // tra mật
                                                                                                              // khẩu
                .map(account -> {
                    String token = jwtUtil.generateToken(account.getEmail(), account.getRole().name());
                    return new LoginResponse(token, "Bearer", account.getEmail(), account.getRole().name());
                })
                .switchIfEmpty(Mono.error(new UnauthorizedException("Email hoac mat khau khong chinh xac!")));
    }

    @Override
    public Mono<RegisterResponse> register(RegisterRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        String normalizedPhone = normalizePhone(request.getPhoneNumber());

        Mono<Boolean> checkEmail = accountRepository.existsByEmail(normalizedEmail)
                .flatMap(exists -> exists
                        ? Mono.error(new ConflictException("Email da duoc su dung"))
                        : Mono.just(false));

        Mono<Boolean> checkPhone = StringUtils.hasText(normalizedPhone) // kiểm tra nếu số điện thoại được cung cấp, nếu
                                                                        // có thì kiểm tra trùng lặp, nếu không có thì
                                                                        // bỏ qua
                ? accountRepository.existsByPhoneNumber(normalizedPhone)
                        .flatMap(exists -> exists
                                ? Mono.error(new ConflictException("So dien thoai da duoc su dung"))
                                : Mono.just(false)) // Neu so dien thoai khong duoc cung cap, bo qua viec kiem tra va
                                                    // tiep tuc dang ky
                : Mono.just(false);

        return Mono.when(checkEmail, checkPhone)
                .then(accountRepository.save(buildUserAccount(request, normalizedEmail, normalizedPhone)))
                .map(saved -> new RegisterResponse(
                        saved.getId().toString(),
                        saved.getEmail(),
                        saved.getFullName(),
                        saved.getRole().name(),
                        "Dang ky tai khoan thanh cong"));
    }

    private Account buildUserAccount(RegisterRequest request, String normalizedEmail, String normalizedPhone) {
        OffsetDateTime now = OffsetDateTime.now();

        return Account.builder()
                .id(UUID.randomUUID())
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .phoneNumber(normalizedPhone)
                .role(AccountRole.USER)
                .isActive(true)
                .createdAt(now)
                .updatedAt(now)
                .build();
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizePhone(String phoneNumber) {
        return StringUtils.hasText(phoneNumber) ? phoneNumber.trim() : null;
    }
}
