package com.project.tech_gadget_store.entity;


import lombok.Getter;
import lombok.Setter;
import com.project.tech_gadget_store.entity.enums.PaymentLogStatus;
import jakarta.persistence.*;

@Entity
@Table(name = "payment_logs")
@Getter
@Setter
public class PaymentLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 40)
    private PaymentLogStatus status;

    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;
}
