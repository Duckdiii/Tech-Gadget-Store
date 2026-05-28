package com.project.tech_gadget_store.entity;

import io.r2dbc.postgresql.codec.Json;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import org.springframework.util.StringUtils;

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

    public static void validateForCreate(UUID productId, String skuCode, BigDecimal price, Integer stockQuantity,
            Integer lockedQuantity) {
        if (productId == null) {
            throw new IllegalArgumentException("Product ID cannot be null");
        }
        if (!StringUtils.hasText(skuCode)) {
            throw new IllegalArgumentException("SKU code cannot be blank");
        }
        if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Price must be greater than 0");
        }
        if (stockQuantity == null || stockQuantity < 0) {
            throw new IllegalArgumentException("Stock quantity cannot be negative");
        }
        if (lockedQuantity == null || lockedQuantity < 0) {
            throw new IllegalArgumentException("Locked quantity cannot be negative");
        }
        if (lockedQuantity > stockQuantity) {
            throw new IllegalArgumentException("Locked quantity cannot be greater than stock quantity");
        }
    }

    public static String normalizeSkuCode(String skuCode) {
        if (!StringUtils.hasText(skuCode)) {
            throw new IllegalArgumentException("SKU code cannot be blank");
        }
        return skuCode.trim();
    }

    public static ProductVariant createNew(UUID productId, String skuCode, String variantName, BigDecimal price,
            String imageUrl, Json attributes, Integer stockQuantity, Integer lockedQuantity, Boolean isActive) {
        validateForCreate(productId, skuCode, price, stockQuantity, lockedQuantity);
        OffsetDateTime now = OffsetDateTime.now();

        return ProductVariant.builder()
                .id(UUID.randomUUID())
                .productId(productId)
                .skuCode(normalizeSkuCode(skuCode))
                .variantName(variantName)
                .price(price)
                .imageUrl(imageUrl)
                .attributes(attributes)
                .stockQuantity(stockQuantity)
                .lockedQuantity(lockedQuantity)
                .isActive(isActive != null ? isActive : Boolean.TRUE)
                .createdAt(now)
                .updatedAt(now)
                .build();
    }

}
