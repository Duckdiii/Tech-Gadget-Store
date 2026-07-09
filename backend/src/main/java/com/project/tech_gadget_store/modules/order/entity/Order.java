package com.project.tech_gadget_store.modules.order.entity;

import com.project.tech_gadget_store.common.entity.BaseEntity;
import com.project.tech_gadget_store.modules.auth.entity.Address;
import com.project.tech_gadget_store.modules.auth.entity.Customer;
import com.project.tech_gadget_store.modules.order.entity.enums.OrderStatus;
import com.project.tech_gadget_store.modules.payment.entity.PaymentMethod;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.*;


@Entity
@Table(name = "orders")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "address_id", nullable = false)
    private Address address;

    @Builder.Default
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "order_id", nullable = false)
    private List<OrderItem> items = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "selected_payment_method_id", nullable = false)
    private PaymentMethod selectedPaymentMethod;

    @Column(name = "order_date", nullable = false)
    private LocalDateTime orderDate;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "order_status", nullable = false, length = 40)
    private OrderStatus orderStatus = OrderStatus.AWAITING_CONFIRMATION;

    public Order(Customer customer, Address address, PaymentMethod selectedPaymentMethod) {
        if (customer == null) {
            throw new IllegalArgumentException("customer must not be null");
        }
        if (address == null) {
            throw new IllegalArgumentException("address must not be null");
        }
        if (selectedPaymentMethod == null) {
            throw new IllegalArgumentException("selectedPaymentMethod must not be null");
        }
        this.customer = customer;
        this.address = address;
        this.selectedPaymentMethod = selectedPaymentMethod;
        this.orderDate = LocalDateTime.now();
    }

    public void addItem(OrderItem item) {
        if (item == null) {
            throw new IllegalArgumentException("item must not be null");
        }
        if (!items.contains(item)) {
            items.add(item);
        }
    }

    public void removeItem(OrderItem item) {
        if (item == null) {
            return;
        }
        if (items.remove(item)) {
            item.getBundleServices().clear();
        }
    }

    public void assignPaymentMethod(PaymentMethod paymentMethod) {
        if (paymentMethod == null) {
            throw new IllegalArgumentException("paymentMethod must not be null");
        }
        selectedPaymentMethod = paymentMethod;
    }

    public void confirm() {
        this.orderStatus.confirm(this);
    }

    public void markPaid() {
        this.paidAt = LocalDateTime.now();
        this.orderStatus.markPaid(this);
    }

    public void markShipping() {
        this.orderStatus.markShipping(this);
    }

    public void complete() {
        this.orderStatus.complete(this);
    }

    public void cancel() {
        this.orderStatus.cancel(this);
    }

    public void refund() {
        this.orderStatus.refund(this);
    }

    public boolean canCancel() {
        return this.orderStatus.canCancel();
    }

    public void transitionTo(OrderStatus targetStatus) {
        if (this.orderStatus == targetStatus) {
            return;
        }
        switch (targetStatus) {
            case PROCESSING -> confirm();
            case SHIPPING -> markShipping();
            case COMPLETED -> complete();
            case CANCELLED -> cancel();
            case REFUNDED -> refund();
            default -> throw new IllegalStateException("Không thể chuyển tiếp sang trạng thái: " + targetStatus);
        }
    }

    public boolean isPaid() {
        return paidAt != null;
    }

    public BigDecimal calculateSubtotal() {
        return items.stream()
                .map(OrderItem::calculateTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal calculateTotal() {
        return calculateSubtotal();
    }

    @PrePersist
    protected void prePersistOrder() {
        if (orderDate == null) {
            orderDate = LocalDateTime.now();
        }
    }

}
