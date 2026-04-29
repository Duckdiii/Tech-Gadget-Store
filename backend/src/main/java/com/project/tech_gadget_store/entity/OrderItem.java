package com.project.tech_gadget_store.entity;

import io.r2dbc.postgresql.codec.Json;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("order_items")
public class OrderItem {
    @Id
    private UUID id;
    @Column("order_id")
    private UUID orderId;
    @Column("variant_id")
    private UUID variantId;
    private Integer quantity;
    @Column("unit_price")
    private BigDecimal unitPrice;
    @Column("variant_snapshot")
    private Json variantSnapshot;
}
