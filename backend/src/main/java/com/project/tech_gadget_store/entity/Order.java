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

    public Order(Customer customer, PaymentMethod selectedPaymentMethod) {
        if (customer == null) {
            throw new IllegalArgumentException("customer must not be null");
        }
        this.customer = customer;
        this.selectedPaymentMethod = selectedPaymentMethod;
        customer.getOrders().add(this);
    }

    public void addItem(OrderItem item) {
        if (item == null) {
            throw new IllegalArgumentException("item must not be null");
        }
        if (item.getOrder() != null && item.getOrder() != this) {
            item.getOrder().getItems().remove(item);
        }
        if (!items.contains(item)) {
            items.add(item);
        }
        item.setOrder(this);
    }

    public void removeItem(OrderItem item) {
        if (item == null) {
            return;
        }
        if (items.remove(item)) {
            item.getBundleServices().clear();
            item.setOrder(null);
        }
    }

    public void assignPaymentMethod(PaymentMethod paymentMethod) {
        if (paymentMethod == null) {
            throw new IllegalArgumentException("paymentMethod must not be null");
        }
        selectedPaymentMethod = paymentMethod;
    }

    public void markAwaitingConfirmation() {
        orderStatus = OrderStatus.AWAITING_CONFIRMATION;
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
        if (paymentLog.getOrder() != null && paymentLog.getOrder() != this) {
            paymentLog.getOrder().getPaymentLogs().remove(paymentLog);
        }
        if (!paymentLogs.contains(paymentLog)) {
            paymentLogs.add(paymentLog);
        }
        paymentLog.setOrder(this);
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
