package com.project.tech_gadget_store.dto.response;

import com.project.tech_gadget_store.entity.ProductVariant;

import java.time.OffsetDateTime;
import java.util.UUID;

import io.r2dbc.postgresql.codec.Json;

//record tự động có sẵn constructor, getter, equals, hashCode, toString

public record ProductVariantResponse(

        UUID id,
        UUID productId,
        String skuCode,
        String variantName,
        double price,
        String imageUrl,
        Json attributes,
        int stockQuantity,
        int lockedQuantity,
        Boolean isActive,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {
    public static ProductVariantResponse fromEntity(ProductVariant productVariant) {
        return new ProductVariantResponse(
                productVariant.getId(),
                productVariant.getProductId(),
                productVariant.getSkuCode(),
                productVariant.getVariantName(),
                productVariant.getPrice().doubleValue(),
                productVariant.getImageUrl(),
                productVariant.getAttributes(),
                productVariant.getStockQuantity(),
                productVariant.getLockedQuantity(),
                productVariant.getIsActive(),
                productVariant.getCreatedAt(),
                productVariant.getUpdatedAt());
    }
}
