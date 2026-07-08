package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.request.StaffRequestDto;
import com.project.tech_gadget_store.dto.request.UpdateStaffRequestDto;
import com.project.tech_gadget_store.dto.response.StaffResponseDto;
import com.project.tech_gadget_store.entity.Account;
import com.project.tech_gadget_store.entity.Staff;
import com.project.tech_gadget_store.entity.enums.AuditAction;
import com.project.tech_gadget_store.exception.DuplicateResourceException;
import com.project.tech_gadget_store.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.repository.AccountRepository;
import com.project.tech_gadget_store.repository.StaffRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
public class StaffService {

    private final StaffRepository staffRepository;
    private final AccountRepository accountRepository;
    private final AccountService accountService;
    private final PasswordEncoder passwordEncoder;

    public StaffService(StaffRepository staffRepository,
            AccountRepository accountRepository,
            AccountService accountService,
            PasswordEncoder passwordEncoder) {
        this.staffRepository = staffRepository;
        this.accountRepository = accountRepository;
        this.accountService = accountService;
        this.passwordEncoder = passwordEncoder;
    }

    public List<StaffResponseDto> getAllStaff() {
        return staffRepository.findAll().stream()
                .map(staff -> {
                    Account account = staff.getAccount();
                    return StaffResponseDto.builder()
                            .id(staff.getId())
                            .createdAt(staff.getCreatedAt())
                            .updatedAt(staff.getUpdatedAt())
                            .fullName(staff.getFullName())
                            .phone(staff.getPhone())
                            .staffCode(staff.getStaffCode())
                            .hireDate(staff.getHireDate())
                            .email(account != null ? account.getEmail() : null)
                            .accountId(account != null ? account.getId() : null)
                            .build();
                })
                .toList();
    }

    @Transactional
    public StaffResponseDto addStaff(StaffRequestDto dto) {
        if (accountRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateResourceException("Email already exists");
        }

        Staff staff = new Staff(dto.getFullName(), dto.getPhone(), dto.getStaffCode(), dto.getHireDate());
        staffRepository.save(staff);

        // Create Account use case (included)
        Account account = accountService.createStaffAccount(dto.getEmail(), dto.getPassword(), staff);

        return StaffResponseDto.builder()
                .id(staff.getId())
                .createdAt(staff.getCreatedAt())
                .updatedAt(staff.getUpdatedAt())
                .fullName(staff.getFullName())
                .phone(staff.getPhone())
                .staffCode(staff.getStaffCode())
                .hireDate(staff.getHireDate())
                .email(account.getEmail())
                .accountId(account.getId())
                .build();
    }

    @Transactional
    public void deleteStaff(String staffId) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));

        Account account = staff.getAccount();
        if (account == null) {
            throw new ResourceNotFoundException("Account does not exist for this staff");
        }

        // Delete Account use case (included)
        accountService.deleteStaffAccount(account);

        log.info("Action: {} | staffId: {} | staffCode: {}", AuditAction.DELETE_STAFF, staffId, staff.getStaffCode());
        staffRepository.delete(staff);
     }

    @Transactional
    public StaffResponseDto updateStaff(String staffId, UpdateStaffRequestDto dto) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));

        if (!staff.getStaffCode().equals(dto.getStaffCode()) && staffRepository.existsByStaffCode(dto.getStaffCode())) {
            throw new DuplicateResourceException("Staff code already exists");
        }

        Account account = staff.getAccount();
        if (account != null) {
            if (!account.getEmail().equalsIgnoreCase(dto.getEmail()) && accountRepository.existsByEmail(dto.getEmail())) {
                throw new DuplicateResourceException("Email already exists");
            }
            account.setEmail(dto.getEmail());
            if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
                if (dto.getPassword().length() < 6) {
                    throw new IllegalArgumentException("Password must be at least 6 characters");
                }
                account.setPassword(passwordEncoder.encode(dto.getPassword()));
            }
            accountRepository.save(account);
        }

        staff.setFullName(dto.getFullName());
        staff.setPhone(dto.getPhone());
        staff.setStaffCode(dto.getStaffCode());
        staff.setHireDate(dto.getHireDate());
        staffRepository.save(staff);

        return StaffResponseDto.builder()
                .id(staff.getId())
                .createdAt(staff.getCreatedAt())
                .updatedAt(staff.getUpdatedAt())
                .fullName(staff.getFullName())
                .phone(staff.getPhone())
                .staffCode(staff.getStaffCode())
                .hireDate(staff.getHireDate())
                .email(account != null ? account.getEmail() : null)
                .accountId(account != null ? account.getId() : null)
                .build();
    }
}
