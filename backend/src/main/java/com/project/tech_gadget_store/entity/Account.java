package com.project.tech_gadget_store.entity;

import lombok.Getter;
import lombok.Setter;
import com.project.tech_gadget_store.entity.enums.AccountStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "accounts", uniqueConstraints = {
                @UniqueConstraint(name = "uk_accounts_email", columnNames = "email"),
                @UniqueConstraint(name = "uk_accounts_user", columnNames = "user_id")
})
@Getter
@Setter
public class Account extends BaseEntity {

        @Column(name = "email", nullable = false, length = 150)
        private String email;

        @Column(name = "password", nullable = false, length = 255)
        private String password;

        @Enumerated(EnumType.STRING)
        @Column(name = "status", nullable = false, length = 30)
        private AccountStatus status = AccountStatus.ACTIVE;

        @Column(name = "last_login_at")
        private LocalDateTime lastLoginAt;

        @OneToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "user_id", nullable = false, unique = true)
        private User user;

        @OneToMany(mappedBy = "account", fetch = FetchType.LAZY)
        private List<LoginLog> loginLogs = new ArrayList<>();
}
