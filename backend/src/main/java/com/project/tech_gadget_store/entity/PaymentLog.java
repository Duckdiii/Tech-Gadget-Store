package com.project.tech_gadget_store.entity;


import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import com.project.tech_gadget_store.entity.enums.PaymentLogStatus;
import jakarta.persistence.*;

@Entity
@Table(name = "payment_logs")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PaymentLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 40)
    private PaymentLogStatus status;

    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;

    public PaymentLog(Order order, PaymentLogStatus status, String failureReason) {
        this.status = status;
        this.failureReason = failureReason;
        order.addPaymentLog(this);
    }
}
