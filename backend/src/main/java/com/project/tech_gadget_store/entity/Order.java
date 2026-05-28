package com.project.tech_gadget_store.entity;

import com.project.tech_gadget_store.entity.enums.OrderStatus;
import com.project.tech_gadget_store.entity.enums.PaymentStatus;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Locale;
import java.util.Objects;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("orders")
public class Order {
    @Id
    private UUID id;
    @Column("account_id")
    private UUID accountId;
    @Column("voucher_id")
    private UUID voucherId;
    @Column("orderCode")
    private String orderCode;
    @Column("shipping_address_snapshot")
    private String shippingAddressSnapshot;
    @Column("payment_method")
    private String paymentMethod;
    @Column("payment_status")
    private String paymentStatus;
    @Setter(AccessLevel.NONE)
    @Column("order_status")
    private String orderStatus;
    private BigDecimal subtotal;
    @Column("discount_amount")
    private BigDecimal discountAmount;
    @Column("shipping_fee")
    private BigDecimal shippingFee;
    @Column("total_amount")
    private BigDecimal totalAmount;
    @Column("created_at")
    private OffsetDateTime createdAt;
    @Column("updated_at")
    private OffsetDateTime updatedAt;

    public static String normalizeOrderStatus(String orderStatus) {
        if (orderStatus == null || orderStatus.isBlank()) {
            throw new IllegalArgumentException("Trang thai don hang khong hop le");
        }

        String normalized = orderStatus.trim().toUpperCase(Locale.ROOT);
        OrderStatus.valueOf(normalized);
        return normalized;
    }

    public boolean hasStatus(OrderStatus status) {
        return status != null && status.name().equals(orderStatus);
    }

    public void changeStatus(String newStatus) {
        this.orderStatus = normalizeOrderStatus(newStatus);
        this.updatedAt = OffsetDateTime.now();
    }

    public void assignAccount(UUID accountId) { // thay thế setter
        this.accountId = Objects.requireNonNull(accountId, "accountId must not be null");
        this.updatedAt = OffsetDateTime.now();
    }

    public void changePaymentStatus(String paymentStatus) { // thay thế setter
        if (!StringUtils.hasText(paymentStatus)) {
            throw new IllegalArgumentException("Trang thai thanh toan khong hop le");
        }
        String normalized = paymentStatus.trim().toUpperCase(Locale.ROOT);
        PaymentStatus.valueOf(normalized);
        this.paymentStatus = normalized;
        this.updatedAt = OffsetDateTime.now();
    }

    public void updateCheckoutInfo(String shippingAddressSnapshot, String paymentMethod) { // thay thế setter
        this.shippingAddressSnapshot = shippingAddressSnapshot;
        this.paymentMethod = paymentMethod;
        this.updatedAt = OffsetDateTime.now();
    }

    public void applyPriceSummary( // thay thế setter
            BigDecimal subtotal,
            BigDecimal discountAmount,
            BigDecimal shippingFee,
            BigDecimal totalAmount) {
        this.subtotal = subtotal;
        this.discountAmount = discountAmount;
        this.shippingFee = shippingFee;
        this.totalAmount = totalAmount;
        this.updatedAt = OffsetDateTime.now();
    }

    public void cancelPendingOrder() {
        if (!hasStatus(OrderStatus.PENDING)) {
            throw new IllegalStateException("Chi duoc huy don hang o trang thai PENDING");
        }
        this.orderStatus = OrderStatus.CANCELLED.name();
        this.updatedAt = OffsetDateTime.now();
    }
}
