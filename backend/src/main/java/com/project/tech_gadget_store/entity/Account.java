package com.project.tech_gadget_store.entity;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import com.project.tech_gadget_store.entity.enums.AccountStatus;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "accounts", uniqueConstraints = {
                @UniqueConstraint(name = "uk_accounts_email", columnNames = "email"),
                @UniqueConstraint(name = "uk_accounts_user", columnNames = "user_id")
})
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Account extends BaseEntity {

        @Column(name = "email", nullable = false, length = 150)
        private String email;

        @Column(name = "password", nullable = false, length = 255)
        private String password;

        @Enumerated(EnumType.STRING)
        @Column(name = "status", nullable = false, length = 30)
        private AccountStatus status = AccountStatus.ACTIVE;

        @OneToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "user_id", nullable = false, unique = true)
        private User user;

        @OneToMany(mappedBy = "account", fetch = FetchType.LAZY)
        private List<LoginLog> loginLogs = new ArrayList<>();

        public Account(String email, String password, User user) {
                this.email = email;
                this.password = password;
                attachUser(user);
        }

        public void activate() {
                status = AccountStatus.ACTIVE;
        }

        public void block() {
                status = AccountStatus.BLOCKED;
        }

        public void unlock() {
                activate();
        }

        public boolean isActive() {
                return AccountStatus.ACTIVE.equals(status);
        }

        public boolean isBlocked() {
                return AccountStatus.BLOCKED.equals(status);
        }

        public void changePassword(String encodedPassword) {
                if (encodedPassword == null || encodedPassword.isBlank()) {
                        throw new IllegalArgumentException("encodedPassword must not be blank");
                }
                password = encodedPassword;
        }

        public void recordLoginSuccess() {
                LoginLog.success(this);
        }

        public void recordLoginFailure() {
                LoginLog.failure(this, null);
        }

        public void attachUser(User user) {
                if (user == null) {
                        throw new IllegalArgumentException("user must not be null");
                }
                if (this.user == user) {
                        user.setAccount(this);
                        return;
                }
                if (this.user != null) {
                        this.user.setAccount(null);
                }
                if (user.getAccount() != null && user.getAccount() != this) {
                        user.getAccount().setUser(null);
                }
                this.user = user;
                user.setAccount(this);
        }
}
