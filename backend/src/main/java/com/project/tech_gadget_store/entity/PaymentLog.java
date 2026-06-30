package com.project.tech_gadget_store.entity;

import com.project.tech_gadget_store.entity.enums.PaymentLogStatus;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_logs")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PaymentLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "order_id", nullable = true)
    private Order order;

    @Column(name = "amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 40)
    private PaymentLogStatus status;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;

    public PaymentLog(Order order, BigDecimal amount, PaymentLogStatus status) {
        if (amount == null) {
            throw new IllegalArgumentException("amount must not be null");
        }
        if (status == null) {
            throw new IllegalArgumentException("status must not be null");
        }
        this.order = order;
        this.amount = amount;
        this.status = status;
    }

    public void markSuccess() {
        this.status = PaymentLogStatus.SUCCESS;
        this.paidAt = LocalDateTime.now();
        this.failureReason = null;
    }

    public void markFailed(String reason) {
        this.status = PaymentLogStatus.FAILED;
        this.failureReason = reason;
    }

    public boolean isSuccess() {
        return PaymentLogStatus.SUCCESS.equals(status);
    }

    public boolean isFailed() {
        return PaymentLogStatus.FAILED.equals(status);
    }
}
