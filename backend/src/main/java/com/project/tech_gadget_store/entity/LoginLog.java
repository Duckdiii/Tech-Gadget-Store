package com.project.tech_gadget_store.entity;


import lombok.Getter;
import lombok.Setter;
import com.project.tech_gadget_store.entity.enums.LoginStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "login_logs")
@Getter
@Setter
public class LoginLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id")
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
}
