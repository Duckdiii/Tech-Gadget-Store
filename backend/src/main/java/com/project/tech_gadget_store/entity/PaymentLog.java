package com.project.tech_gadget_store.entity;

import com.project.tech_gadget_store.entity.enums.PaymentLogStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "payment_logs")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PaymentLog extends BaseEntity {

    @Column(name = "order_id", nullable = false, length = 36)
    private String orderId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 40)
    private PaymentLogStatus status;

    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;

    public PaymentLog(String orderId, PaymentLogStatus status, String failureReason) {
        if (orderId == null || orderId.isBlank()) {
            throw new IllegalArgumentException("orderId must not be blank");
        }
        if (status == null) {
            throw new IllegalArgumentException("status must not be null");
        }
        this.orderId = orderId;
        this.status = status;
        this.failureReason = failureReason;
    }

    public void markSuccess() {
        status = PaymentLogStatus.SUCCESS;
        failureReason = null;
    }

    public void markFailed(String reason) {
        status = PaymentLogStatus.FAILED;
        failureReason = reason;
    }

    public boolean isSuccess() {
        return PaymentLogStatus.SUCCESS.equals(status);
    }

    public boolean isFailed() {
        return PaymentLogStatus.FAILED.equals(status);
    }
}
