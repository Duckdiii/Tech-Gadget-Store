package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.entity.enums.AccountStatus;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.project.tech_gadget_store.dto.response.LoginLogResponseDto;
import com.project.tech_gadget_store.dto.response.AccountResponseDto;
import com.project.tech_gadget_store.entity.Account;
import com.project.tech_gadget_store.entity.enums.LoginStatus;
import com.project.tech_gadget_store.repository.AccountRepository;

@Service

public class AccountService {

    private final AccountRepository accountRepository;

    public AccountService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
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

}
