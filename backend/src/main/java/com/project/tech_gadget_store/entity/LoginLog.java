package com.project.tech_gadget_store.entity;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import com.project.tech_gadget_store.entity.enums.LoginStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "login_logs")
@Getter
@Setter

@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class LoginLog extends BaseEntity {

    @Column(name = "email", nullable = false, length = 150)
    private String email;

    @Column(name = "role_name", length = 50)
    private String roleName;

    @Enumerated(EnumType.STRING)
    @Column(name = "login_status", nullable = false, length = 30)
    private LoginStatus loginStatus;

    @Column(name = "login_time", nullable = false)
    private LocalDateTime loginTime;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    public LoginLog(Account account, String email, String roleName, LoginStatus loginStatus, String ipAddress) {
        if (account == null) {
            throw new IllegalArgumentException("account must not be null");
        }
        this.email = email;
        this.roleName = roleName;
        this.loginStatus = loginStatus;
        this.ipAddress = ipAddress;
        this.loginTime = LocalDateTime.now();
        account.getLoginLogs().add(this);
    }

    public static LoginLog success(Account account) {
        if (account == null) {
            throw new IllegalArgumentException("account must not be null");
        }
        return new LoginLog(account, account.getEmail(), resolveRoleName(account), LoginStatus.SUCCESS, null);
    }

    private static String resolveRoleName(Account account) {
        User user = account.getUser();
        if (user instanceof Manager) {
            return "MANAGER";
        }
        if (user instanceof Staff) {
            return "STAFF";
        }
        if (user instanceof Customer) {
            return "CUSTOMER";
        }
        return null;
    }

    public static LoginLog failure(Account account, String ipAddress) {
        if (account == null) {
            throw new IllegalArgumentException("account must not be null");
        }
        return new LoginLog(account, account.getEmail(), resolveRoleName(account), LoginStatus.FAILED, ipAddress);
    }

    public boolean isSuccess() {
        return LoginStatus.SUCCESS.equals(loginStatus);
    }
}
