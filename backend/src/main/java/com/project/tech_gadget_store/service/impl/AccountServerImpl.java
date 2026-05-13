package com.project.tech_gadget_store.service.impl;

import com.project.tech_gadget_store.dto.request.LoginRequest;
import com.project.tech_gadget_store.dto.request.RegisterRequest;
import com.project.tech_gadget_store.dto.response.LoginResponse;
import com.project.tech_gadget_store.dto.response.RegisterResponse;
import com.project.tech_gadget_store.entity.Account;
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

@Service
@RequiredArgsConstructor
public class AccountServerImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public Mono<LoginResponse> login(LoginRequest request) {
        String normalizedEmail = Account.normalizeEmail(request.getEmail());

        return accountRepository.findByEmail(normalizedEmail)
                .filter(Account::isActiveAccount)
                .filter(account -> passwordEncoder.matches(request.getPassword(), account.getPasswordHash()))
                .map(account -> {
                    String token = jwtUtil.generateToken(account.getEmail(), account.getRole().name());
                    return new LoginResponse(token, "Bearer", account.getEmail(), account.getRole().name());
                })
                .switchIfEmpty(Mono.error(new UnauthorizedException("Email hoac mat khau khong chinh xac!")));
    }

    @Override
    public Mono<RegisterResponse> register(RegisterRequest request) {
        String normalizedEmail = Account.normalizeEmail(request.getEmail());
        String normalizedPhone = Account.normalizePhone(request.getPhoneNumber());

        Mono<Boolean> checkEmail = accountRepository.existsByEmail(normalizedEmail)
                .flatMap(exists -> exists
                        ? Mono.error(new ConflictException("Email da duoc su dung"))
                        : Mono.just(false));

        Mono<Boolean> checkPhone = StringUtils.hasText(normalizedPhone)
                ? accountRepository.existsByPhoneNumber(normalizedPhone)
                        .flatMap(exists -> exists
                                ? Mono.error(new ConflictException("So dien thoai da duoc su dung"))
                                : Mono.just(false))
                : Mono.just(false);

        return Mono.when(checkEmail, checkPhone)
                .then(accountRepository.save(Account.createUserAccount(
                        request.getEmail(),
                        passwordEncoder.encode(request.getPassword()),
                        request.getFullName(),
                        request.getPhoneNumber())))
                .map(saved -> new RegisterResponse(
                        saved.getId().toString(),
                        saved.getEmail(),
                        saved.getFullName(),
                        saved.getRole().name(),
                        "Dang ky tai khoan thanh cong"));
    }
}
