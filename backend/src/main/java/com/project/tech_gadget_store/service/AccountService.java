package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.response.AccountResponseDto;
import com.project.tech_gadget_store.dto.response.LoginLogResponseDto;
import com.project.tech_gadget_store.entity.Account;
import com.project.tech_gadget_store.entity.Staff;
import com.project.tech_gadget_store.entity.enums.AccountStatus;
import com.project.tech_gadget_store.entity.enums.AuditAction;
import com.project.tech_gadget_store.entity.enums.LoginStatus;
import com.project.tech_gadget_store.exception.DuplicateResourceException;
import com.project.tech_gadget_store.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.repository.AccountRepository;
import com.project.tech_gadget_store.repository.LoginLogRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final LoginLogRepository loginLogRepository;
    private final PasswordEncoder passwordEncoder;

    public AccountService(AccountRepository accountRepository,
            LoginLogRepository loginLogRepository,
            PasswordEncoder passwordEncoder) {
        this.accountRepository = accountRepository;
        this.loginLogRepository = loginLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<AccountResponseDto> getAllAccounts() {
        return accountRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    public AccountResponseDto blockAccountById(String id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + id));
        account.setStatus(AccountStatus.BLOCKED);
        accountRepository.save(account);
        return toDto(account);
    }

    public AccountResponseDto unblockAccountById(String id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + id));
        account.setStatus(AccountStatus.ACTIVE);
        accountRepository.save(account);
        return toDto(account);
    }

    @Transactional
    public void deleteAccountById(String id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with id: " + id));
        deleteStaffAccount(account);
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

        return toDto(account);
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

    @Transactional
    public void deleteStaffAccount(Account account) {
        if (account == null) {
            throw new ResourceNotFoundException("Account does not exist");
        }
        if (!(account.getUser() instanceof Staff)) {
            throw new IllegalStateException("Account deletion is not allowed for this account type");
        }
        loginLogRepository.deleteByAccountId(account.getId());
        log.info("Action: {} | accountId: {} | email: {}", AuditAction.DELETE_ACCOUNT, account.getId(),
                account.getEmail());
        accountRepository.delete(account);
    }

    private AccountResponseDto toDto(Account account) {
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
