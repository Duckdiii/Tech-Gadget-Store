package com.project.tech_gadget_store.entity;

import com.project.tech_gadget_store.entity.enums.AccountRole;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;

import java.time.OffsetDateTime;
import java.util.Locale;
import java.util.Objects;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("accounts")
public class Account {
    @Id
    private UUID id;
    private String email;
    @Column("password_hash")
    private String passwordHash;
    @Column("full_name")
    private String fullName;
    @Column("phone_number")
    private String phoneNumber;
    private AccountRole role;
    @Column("is_active")
    private Boolean isActive;
    @Column("created_at")
    private OffsetDateTime createdAt;
    @Column("updated_at")
    private OffsetDateTime updatedAt;

    public static String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    public static String normalizePhone(String phoneNumber) {
        return StringUtils.hasText(phoneNumber) ? phoneNumber.trim() : null;
    }

    public static String normalizeFullName(String fullName) {
        if (!StringUtils.hasText(fullName)) {
            throw new IllegalArgumentException("Ho ten khong hop le");
        }
        return fullName.trim();
    }

    public static Account createUserAccount(
            String email,
            String encodedPassword,
            String fullName,
            String phoneNumber) {
        OffsetDateTime now = OffsetDateTime.now();
        return Account.builder()
                .id(UUID.randomUUID())
                .email(normalizeEmail(email))
                .passwordHash(encodedPassword)
                .fullName(normalizeFullName(fullName))
                .phoneNumber(normalizePhone(phoneNumber))
                .role(AccountRole.USER)
                .isActive(true)
                .createdAt(now)
                .updatedAt(now)
                .build();
    }

    public boolean isActiveAccount() {
        return Boolean.TRUE.equals(isActive);
    }

    public boolean canLogin(String rawPassword, PasswordEncoder passwordEncoder) {
        Objects.requireNonNull(passwordEncoder, "passwordEncoder must not be null");
        return isActiveAccount()
                && StringUtils.hasText(passwordHash)
                && passwordEncoder.matches(rawPassword, passwordHash);
    }

    public String roleName() {
        return role == null ? AccountRole.USER.name() : role.name();
    }

}
