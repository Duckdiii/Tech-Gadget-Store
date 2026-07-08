package com.project.tech_gadget_store.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

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
