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
@Table("product_variants")
public class ProductVariant {
    @Id
    private UUID id;
    @Column("product_id")
    private UUID productId;
    @Column("sku_code")
    private String skuCode;
    @Column("variant_name")
    private String variantName;
    private BigDecimal price;
    @Column("image_url")
    private String imageUrl;
    private Json attributes;
    @Column("stock_quantity")
    private Integer stockQuantity;
    @Column("locked_quantity")
    private Integer lockedQuantity;
    @Column("is_active")
    private Boolean isActive;
    @Column("created_at")
    private OffsetDateTime createdAt;
    @Column("updated_at")
    private OffsetDateTime updatedAt;
}
