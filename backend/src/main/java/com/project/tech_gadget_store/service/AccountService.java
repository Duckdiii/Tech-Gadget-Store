package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.response.AccountResponseDto;
import com.project.tech_gadget_store.dto.response.LoginLogResponseDto;
import com.project.tech_gadget_store.entity.Account;
import com.project.tech_gadget_store.entity.Staff;
import com.project.tech_gadget_store.entity.enums.AccountStatus;
import com.project.tech_gadget_store.entity.enums.LoginStatus;
import com.project.tech_gadget_store.exception.DuplicateResourceException;
import com.project.tech_gadget_store.repository.AccountRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    public AccountService(AccountRepository accountRepository, PasswordEncoder passwordEncoder) {
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public LoginLogResponseDto viewLoginInfo(String email) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Account not found with email: " + email));

        return LoginLogResponseDto.builder()
                .id(account.getId())
                .createdAt(account.getCreatedAt())
                .updatedAt(account.getUpdatedAt())
                .accountId(account.getId())
                .email(account.getEmail())
                .roleName(account.getUser().getClass().getSimpleName())
                .loginStatus(LoginStatus.SUCCESS)
                .loginTime(LocalDateTime.now())
                .build();
    }

    public AccountResponseDto blockAccount(String email) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Account not found with email: " + email));

        account.setStatus(AccountStatus.BLOCKED);
        accountRepository.save(account);

        return AccountResponseDto.builder()
                .id(account.getId())
                .createdAt(account.getCreatedAt())
                .updatedAt(account.getUpdatedAt())
                .email(account.getEmail())
                .status(account.getStatus())
                .userId(account.getUser().getId())
                .loginLogsIds(account.getLoginLogs().stream().map(log -> log.getId()).toList())
                .build();
    }

    @Transactional
    public Account createStaffAccount(String email, String rawPassword, Staff staff) {
        if (accountRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email already exists");
        }
        Account account = new Account(
                email,
                passwordEncoder.encode(rawPassword),
                staff,
                AccountStatus.ACTIVE);
        return accountRepository.save(account);
    }
}
