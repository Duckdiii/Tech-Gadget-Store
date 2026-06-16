package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.request.RegisterRequestDto;
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
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final MembershipRepository membershipRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(AccountRepository accountRepository,
            CustomerRepository customerRepository,
            MembershipRepository membershipRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.accountRepository = accountRepository;
        this.customerRepository = customerRepository;
        this.membershipRepository = membershipRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
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
}
