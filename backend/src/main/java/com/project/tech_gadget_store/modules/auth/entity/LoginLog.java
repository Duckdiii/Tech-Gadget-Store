package com.project.tech_gadget_store.modules.auth.entity;

import com.project.tech_gadget_store.common.entity.BaseEntity;
import com.project.tech_gadget_store.modules.auth.entity.enums.LoginStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;



@Entity
@Table(name = "login_logs")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class LoginLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(name = "email", nullable = false, length = 150)
    private String email;

    @Column(name = "role_name", length = 50)
    private String roleName;

    @Enumerated(EnumType.STRING)
    @Column(name = "login_status", nullable = false, length = 30)
    private LoginStatus loginStatus;

    @Column(name = "login_time", nullable = false)
    private LocalDateTime loginTime;

    public LoginLog(Account account, String email, String roleName, LoginStatus loginStatus) {
        if (account == null) {
            throw new IllegalArgumentException("account must not be null");
        }
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("email must not be blank");
        }
        if (loginStatus == null) {
            throw new IllegalArgumentException("loginStatus must not be null");
        }
        this.account = account;
        this.email = email;
        this.roleName = roleName;
        this.loginStatus = loginStatus;
        this.loginTime = LocalDateTime.now();
        account.getLoginLogs().add(this);
    }

    public static LoginLog success(Account account) {
        if (account == null) {
            throw new IllegalArgumentException("account must not be null");
        }
        return new LoginLog(account, account.getEmail(), account.getUser().getRoleName(), LoginStatus.SUCCESS);
    }

    public static LoginLog failure(Account account) {
        if (account == null) {
            throw new IllegalArgumentException("account must not be null");
        }
        return new LoginLog(account, account.getEmail(), account.getUser().getRoleName(), LoginStatus.FAILED);
    }

    public boolean isSuccess() {
        return LoginStatus.SUCCESS.equals(loginStatus);
    }
}
