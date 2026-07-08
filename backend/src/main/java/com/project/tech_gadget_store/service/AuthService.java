package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.request.ForgotPasswordRequestDto;
import com.project.tech_gadget_store.dto.request.RegisterRequestDto;
import com.project.tech_gadget_store.dto.request.ResetPasswordRequestDto;
import com.project.tech_gadget_store.dto.response.LoginResponseDto;
import com.project.tech_gadget_store.entity.Account;
import com.project.tech_gadget_store.entity.Customer;
import com.project.tech_gadget_store.entity.Membership;
import com.project.tech_gadget_store.entity.enums.AccountStatus;
import com.project.tech_gadget_store.entity.enums.MembershipTier;
import com.project.tech_gadget_store.repository.AccountRepository;
import com.project.tech_gadget_store.repository.CustomerRepository;
import com.project.tech_gadget_store.repository.MembershipRepository;
import com.project.tech_gadget_store.security.AccountUserDetails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final MembershipRepository membershipRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final String frontendUrl;

    public AuthService(AccountRepository accountRepository,
            CustomerRepository customerRepository,
            MembershipRepository membershipRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            EmailService emailService,
            @Value("${app.frontend-url}") String frontendUrl) {
        this.accountRepository = accountRepository;
        this.customerRepository = customerRepository;
        this.membershipRepository = membershipRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.frontendUrl = frontendUrl;
    }

    @Transactional
    public LoginResponseDto register(RegisterRequestDto req) {
        if (accountRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email đã được sử dụng");
        }

        Membership membership = membershipRepository.findByTier(MembershipTier.STANDARD)
                .orElseThrow(() -> new IllegalStateException("Membership STANDARD chưa được cấu hình trong DB"));

        Customer customer = new Customer(req.getFullName(), req.getPhone(), membership);
        customerRepository.save(customer);

        Account account = new Account(
                req.getEmail(),
                passwordEncoder.encode(req.getPassword()),
                customer,
                AccountStatus.ACTIVE);
        accountRepository.save(account);

        AccountUserDetails details = new AccountUserDetails(account);
        String token = jwtService.generateToken(details);
        return new LoginResponseDto(token, account.getEmail(), customer.getFullName(), "CUSTOMER");
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequestDto req) {
        Account account = accountRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản với email này."));

        String token = UUID.randomUUID().toString();
        account.setResetToken(token);
        account.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
        accountRepository.save(account);

        String resetLink = frontendUrl + "/reset-password?token=" + token;
        String subject = "[TechStore] Khôi phục mật khẩu";
        String body = "Xin chào,\n\nBạn đã yêu cầu khôi phục mật khẩu. Vui lòng bấm vào liên kết bên dưới để đặt lại mật khẩu mới:\n" 
                + resetLink + "\n\nLiên kết này có hiệu lực trong vòng 1 giờ.\nNếu bạn không yêu cầu này, vui lòng bỏ qua email này.\n\nTrân trọng,\nTechStore Team";

        emailService.send(req.getEmail(), subject, body);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequestDto req) {
        Account account = accountRepository.findByResetToken(req.getToken())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã khôi phục không hợp lệ hoặc đã hết hạn."));

        if (account.getResetTokenExpiry() == null || account.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mã khôi phục đã hết hạn.");
        }

        account.changePassword(passwordEncoder.encode(req.getPassword()));
        account.setResetToken(null);
        account.setResetTokenExpiry(null);
        accountRepository.save(account);
    }
}
