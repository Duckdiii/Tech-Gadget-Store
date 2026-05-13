package com.project.tech_gadget_store.entity;

import com.project.tech_gadget_store.entity.enums.AccountRole;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.util.StringUtils;

import java.time.OffsetDateTime;
import java.util.Locale;
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
                .fullName(fullName.trim())
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

}
