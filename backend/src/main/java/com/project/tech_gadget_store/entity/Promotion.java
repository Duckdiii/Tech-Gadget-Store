package com.project.tech_gadget_store.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
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
@Table("promotions")
public class Promotion {
    @Id
    private UUID id;

    private String name;

    private String description;

    @Column("discount_type")
    private String discountType;

    @Column("discount_value")
    private BigDecimal discountValue;

    @Column("start_date")
    private OffsetDateTime startDate;

    @Column("end_date")
    private OffsetDateTime endDate;

    @Column("is_active")
    private Boolean isActive;

    @Column("created_at")
    private OffsetDateTime createdAt;

    @Column("updated_at")
    private OffsetDateTime updatedAt;
}
