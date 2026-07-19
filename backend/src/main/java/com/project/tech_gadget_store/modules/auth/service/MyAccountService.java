package com.project.tech_gadget_store.modules.auth.service;

import com.project.tech_gadget_store.modules.auth.dto.request.ChangeMyPasswordRequestDto;
import com.project.tech_gadget_store.modules.auth.dto.response.MyProfileResponseDto;
import com.project.tech_gadget_store.modules.auth.entity.Account;
import com.project.tech_gadget_store.modules.auth.entity.LoginLog;
import com.project.tech_gadget_store.modules.auth.entity.Manager;
import com.project.tech_gadget_store.modules.auth.entity.Staff;
import com.project.tech_gadget_store.modules.auth.entity.User;
import com.project.tech_gadget_store.modules.auth.entity.enums.LoginStatus;
import com.project.tech_gadget_store.modules.auth.repository.AccountRepository;
import com.project.tech_gadget_store.modules.auth.repository.LoginLogRepository;
import com.project.tech_gadget_store.common.exception.ResourceNotFoundException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.hibernate.Hibernate;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



@Service
public class MyAccountService {

    private final AccountRepository accountRepository;
    private final LoginLogRepository loginLogRepository;
    private final PasswordEncoder passwordEncoder;

    public MyAccountService(
            AccountRepository accountRepository,
            LoginLogRepository loginLogRepository,
            PasswordEncoder passwordEncoder) {
        this.accountRepository = accountRepository;
        this.loginLogRepository = loginLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public MyProfileResponseDto getMyProfile(String email) {
        Account account = accountRepository.findByEmailWithUser(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản"));

        User user = account.getUser();
        // user is a lazy proxy of the abstract User type (JOINED inheritance, no discriminator
        // column) — same unproxy requirement as AccountUserDetails.resolveRole.
        Object unproxied = Hibernate.unproxy(user);

        String role;
        String staffCode = null;
        LocalDate hireDate = null;
        if (unproxied instanceof Manager) {
            role = "MANAGER";
        } else if (unproxied instanceof Staff staff) {
            role = "STAFF";
            staffCode = staff.getStaffCode();
            hireDate = staff.getHireDate();
        } else {
            role = "CUSTOMER";
        }

        // Bản ghi mới nhất là phiên đăng nhập hiện tại — lấy bản ghi thứ 2 mới bằng
        // "lần đăng nhập gần đây" theo đúng nghĩa (lần trước đó), không phải phiên đang dùng.
        List<LoginLog> recentLogins = loginLogRepository
                .findByAccountIdAndLoginStatusOrderByLoginTimeDesc(
                        account.getId(), LoginStatus.SUCCESS, PageRequest.of(0, 2));
        LocalDateTime lastLoginAt = recentLogins.size() > 1 ? recentLogins.get(1).getLoginTime() : null;

        return MyProfileResponseDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(account.getEmail())
                .role(role)
                .staffCode(staffCode)
                .hireDate(hireDate)
                .lastLoginAt(lastLoginAt)
                .build();
    }

    @Transactional
    public void changeMyPassword(String email, ChangeMyPasswordRequestDto req) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản"));

        if (!passwordEncoder.matches(req.getCurrentPassword(), account.getPassword())) {
            throw new IllegalArgumentException("Mật khẩu hiện tại không đúng");
        }

        account.changePassword(passwordEncoder.encode(req.getNewPassword()));
        accountRepository.save(account);
    }
}
