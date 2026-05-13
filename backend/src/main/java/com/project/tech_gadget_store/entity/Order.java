package com.project.tech_gadget_store.entity;

import com.project.tech_gadget_store.entity.enums.OrderStatus;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;
import reactor.core.publisher.Flux;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Getter
@Setter
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
    @Getter(AccessLevel.NONE)
    @Transient
    private List<OrderItem> orderItems;

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

    public void cancelPendingOrder() {
        if (!hasStatus(OrderStatus.PENDING)) {
            throw new IllegalStateException("Chi duoc huy don hang o trang thai PENDING");
        }
        this.orderStatus = OrderStatus.CANCELLED.name();
        this.updatedAt = OffsetDateTime.now();
    }

    public Flux<OrderItem> getOrderItems() {
        return orderItems == null ? Flux.empty() : Flux.fromIterable(orderItems);
    }
}
