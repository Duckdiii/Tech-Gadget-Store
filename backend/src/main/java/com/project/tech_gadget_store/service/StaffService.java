package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.request.StaffRequestDto;
import com.project.tech_gadget_store.dto.response.StaffResponseDto;
import com.project.tech_gadget_store.entity.Account;
import com.project.tech_gadget_store.entity.Staff;
import com.project.tech_gadget_store.exception.DuplicateResourceException;
import com.project.tech_gadget_store.repository.AccountRepository;
import com.project.tech_gadget_store.repository.StaffRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StaffService {

    private final StaffRepository staffRepository;
    private final AccountRepository accountRepository;
    private final AccountService accountService;

    public StaffService(StaffRepository staffRepository,
            AccountRepository accountRepository,
            AccountService accountService) {
        this.staffRepository = staffRepository;
        this.accountRepository = accountRepository;
        this.accountService = accountService;
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
}
