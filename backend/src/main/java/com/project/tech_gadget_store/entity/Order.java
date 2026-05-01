package com.project.tech_gadget_store.entity;

import io.r2dbc.postgresql.codec.Json;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
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
}
