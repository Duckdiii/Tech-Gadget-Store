package com.project.tech_gadget_store.entity;


import lombok.Getter;
import lombok.Setter;
import com.project.tech_gadget_store.entity.enums.OrderStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
public class Order extends BaseEntity {

    @Column(name = "transaction_id", unique = true, length = 100)
    private String transactionId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "selected_payment_method_id")
    private PaymentMethod selectedPaymentMethod;

    @Column(name = "order_date", nullable = false)
    private LocalDateTime orderDate;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status", nullable = false, length = 40)
    private OrderStatus orderStatus = OrderStatus.AWAITING_CONFIRMATION;

    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Invoice invoice;

    @OneToMany(mappedBy = "order", fetch = FetchType.LAZY)
    private List<PaymentLog> paymentLogs = new ArrayList<>();

    @PrePersist
    protected void prePersistOrder() {
        if (orderDate == null) {
            orderDate = LocalDateTime.now();
        }
    }
}
