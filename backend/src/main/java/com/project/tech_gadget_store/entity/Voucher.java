package com.project.tech_gadget_store.entity;

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
@Table("vouchers")
public class Voucher {
    @Id
    private UUID id;
    private String code;
    @Column("discount_type")
    private String discountType;
    @Column("discount_value")
    private BigDecimal discountValue;
    @Column("min_order_value")
    private BigDecimal minOrderValue;
    @Column("max_discount")
    private BigDecimal maxDiscount;
    @Column("valid_from")
    private OffsetDateTime validFrom;
    @Column("valid_to")
    private OffsetDateTime validTo;
    @Column("is_active")
    private Boolean isActive;
}
