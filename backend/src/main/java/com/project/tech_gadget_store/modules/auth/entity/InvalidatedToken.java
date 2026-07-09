package com.project.tech_gadget_store.modules.auth.entity;

import com.project.tech_gadget_store.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Table(name = "invalidated_tokens")
@Getter
@Setter
@NoArgsConstructor
public class InvalidatedToken extends BaseEntity {

    @Column(nullable = false, unique = true, length = 1000)
    private String token;

    @Column(name = "expiry_time", nullable = false)
    private LocalDateTime expiryTime;

    public InvalidatedToken(String token, LocalDateTime expiryTime) {
        this.token = token;
        this.expiryTime = expiryTime;
    }
}
