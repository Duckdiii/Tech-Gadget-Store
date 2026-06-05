package com.project.tech_gadget_store.entity;


import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import com.project.tech_gadget_store.entity.enums.PaymentLogStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "payment_logs")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PaymentLog extends BaseEntity {

    @Column(name = "transaction_code", nullable = false, unique = true, length = 100)
    private String transactionCode;

    @Column(name = "amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 40)
    private PaymentLogStatus status;

    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;

    public PaymentLog(Order order, String transactionCode, BigDecimal amount, PaymentLogStatus status,
            String failureReason) {
        if (order == null) {
            throw new IllegalArgumentException("order must not be null");
        }
        if (transactionCode == null || transactionCode.isBlank()) {
            throw new IllegalArgumentException("transactionCode must not be blank");
        }
        if (amount == null || amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("amount must not be negative");
        }
        if (status == null) {
            throw new IllegalArgumentException("status must not be null");
        }
        this.transactionCode = transactionCode;
        this.amount = amount;
        this.status = status;
        this.failureReason = failureReason;
        order.addPaymentLog(this);
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
