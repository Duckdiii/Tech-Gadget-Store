package com.project.tech_gadget_store.modules.auth.service;

import com.project.tech_gadget_store.common.exception.DuplicateResourceException;
import com.project.tech_gadget_store.common.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.modules.auth.dto.request.ForgotPasswordRequestDto;
import com.project.tech_gadget_store.modules.auth.dto.request.RegisterRequestDto;
import com.project.tech_gadget_store.modules.auth.dto.request.ResetPasswordRequestDto;
import com.project.tech_gadget_store.modules.auth.dto.response.LoginResponseDto;
import com.project.tech_gadget_store.modules.auth.entity.Account;
import com.project.tech_gadget_store.modules.auth.entity.Customer;
import com.project.tech_gadget_store.modules.auth.entity.enums.AccountStatus;
import com.project.tech_gadget_store.modules.auth.repository.AccountRepository;
import com.project.tech_gadget_store.modules.auth.repository.CustomerRepository;
import com.project.tech_gadget_store.modules.auth.repository.LoginLogRepository;
import com.project.tech_gadget_store.modules.auth.security.AccountUserDetails;
import com.project.tech_gadget_store.modules.loyalty.entity.Membership;
import com.project.tech_gadget_store.modules.loyalty.entity.enums.MembershipTier;
import com.project.tech_gadget_store.modules.loyalty.repository.MembershipRepository;
import com.project.tech_gadget_store.modules.notification.service.EmailService;
import java.time.Duration;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



@Service
public class AuthService {

    private static final String RESET_TOKEN_PREFIX = "password-reset:";
    private static final Duration RESET_TOKEN_TTL = Duration.ofHours(1);

    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final MembershipRepository membershipRepository;
    private final LoginLogRepository loginLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final StringRedisTemplate redisTemplate;
    private final String frontendUrl;

    public AuthService(AccountRepository accountRepository,
            CustomerRepository customerRepository,
            MembershipRepository membershipRepository,
            LoginLogRepository loginLogRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            EmailService emailService,
            StringRedisTemplate redisTemplate,
            @Value("${app.frontend-url}") String frontendUrl) {
        this.accountRepository = accountRepository;
        this.customerRepository = customerRepository;
        this.membershipRepository = membershipRepository;
        this.loginLogRepository = loginLogRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.redisTemplate = redisTemplate;
        this.frontendUrl = frontendUrl;
    }

    @Transactional
    public void recordLoginSuccess(String email) {
        accountRepository.findByEmail(email)
                .ifPresent(account -> loginLogRepository.save(account.recordLoginSuccess()));
    }

    @Transactional
    public void recordLoginFailure(String email) {
        accountRepository.findByEmail(email)
                .ifPresent(account -> loginLogRepository.save(account.recordLoginFailure()));
    }

    @Transactional
    public LoginResponseDto register(RegisterRequestDto req) {
        if (accountRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new DuplicateResourceException("Email đã được sử dụng");
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

    public void forgotPassword(ForgotPasswordRequestDto req) {
        Account account = accountRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản với email này."));

        String token = UUID.randomUUID().toString();
        redisTemplate.opsForValue().set(RESET_TOKEN_PREFIX + token, account.getId(), RESET_TOKEN_TTL);

        String resetLink = frontendUrl + "/reset-password?token=" + token;
        String subject = "[TechStore] Khôi phục mật khẩu";
        String body = "Xin chào,\n\nBạn đã yêu cầu khôi phục mật khẩu. Vui lòng bấm vào liên kết bên dưới để đặt lại mật khẩu mới:\n"
                + resetLink + "\n\nLiên kết này có hiệu lực trong vòng 1 giờ.\nNếu bạn không yêu cầu này, vui lòng bỏ qua email này.\n\nTrân trọng,\nTechStore Team";

        emailService.send(req.getEmail(), subject, body);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequestDto req) {
        String key = RESET_TOKEN_PREFIX + req.getToken();
        String accountId = redisTemplate.opsForValue().get(key);
        if (accountId == null) {
            throw new IllegalArgumentException("Mã khôi phục không hợp lệ hoặc đã hết hạn.");
        }

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Mã khôi phục không hợp lệ hoặc đã hết hạn."));

        account.changePassword(passwordEncoder.encode(req.getPassword()));
        accountRepository.save(account);
        redisTemplate.delete(key);
    }
}
