package com.project.tech_gadget_store.entity;

import com.project.tech_gadget_store.entity.enums.OrderStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Order extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "address_id", nullable = false)
    private Address address;

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

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status", nullable = false, length = 40)
    private OrderStatus orderStatus = OrderStatus.AWAITING_CONFIRMATION;

    @OneToOne(mappedBy = "order", fetch = FetchType.LAZY)
    private Invoice invoice;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private List<PaymentLog> paymentLogs = new ArrayList<>();

    public Order(Customer customer, Address address, PaymentMethod selectedPaymentMethod) {
        if (address.getUser() != customer) {
            throw new IllegalArgumentException("address does not belong to customer");
        }
        this.customer = customer;
        this.address = address;
        this.selectedPaymentMethod = selectedPaymentMethod;
        address.getOrders().add(this);
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
        orderStatus = OrderStatus.PROCESSING;
    }

    public void markPaid() {
        paidAt = LocalDateTime.now();
        if (OrderStatus.AWAITING_CONFIRMATION.equals(orderStatus)) {
            confirm();
        }
    }

    public void markShipping() {
        orderStatus = OrderStatus.SHIPPING;
    }

    public void complete() {
        orderStatus = OrderStatus.COMPLETED;
    }

    public void cancel() {
        if (!canCancel()) {
            throw new IllegalStateException("Order cannot be cancelled in current status");
        }
        orderStatus = OrderStatus.CANCELLED;
    }

    public boolean canCancel() { // chỉ cho phép hủy khi đang chờ xác nhận hoặc đang xử lý
        return OrderStatus.AWAITING_CONFIRMATION.equals(orderStatus)
                || OrderStatus.PROCESSING.equals(orderStatus);
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
        if (invoice != null && invoice.getFinalAmount() != null) {
            return invoice.getFinalAmount();
        }
        return calculateSubtotal();
    }

    public void assignInvoice(Invoice invoice) {
        if (invoice == null) {
            removeInvoice();
            return;
        }
        if (this.invoice == invoice) {
            invoice.setOrder(this);
            return;
        }
        removeInvoice();
        if (invoice.getOrder() != null && invoice.getOrder() != this) {
            invoice.getOrder().setInvoice(null);
        }
        this.invoice = invoice;
        invoice.setOrder(this);
    }

    public void addPaymentLog(PaymentLog paymentLog) {
        if (paymentLog == null) {
            throw new IllegalArgumentException("paymentLog must not be null");
        }
        if (!paymentLogs.contains(paymentLog)) {
            paymentLogs.add(paymentLog);
        }
    }

    @PrePersist
    protected void prePersistOrder() {
        if (orderDate == null) {
            orderDate = LocalDateTime.now();
        }
    }

    private void removeInvoice() {
        if (invoice == null) {
            return;
        }
        Invoice currentInvoice = invoice;
        invoice = null;
        currentInvoice.setOrder(null);
    }
}
