package com.project.tech_gadget_store.dto.response;

import com.project.tech_gadget_store.entity.Product;

import java.time.OffsetDateTime;
import java.util.UUID;

//record tự động có sẵn constructor, getter, equals, hashCode, toString
public record ProductResponse(
        UUID id,
        UUID categoryId,
        UUID brandId,
        String name,
        String description,
        Boolean isActive,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {

    // fromEntity là hàm map dữ liệu từ Entity sang DTO
    public static ProductResponse fromEntity(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getCategoryId(),
                product.getBrandId(),
                product.getName(),
                product.getDescription(),
                product.getIsActive(),
                product.getCreatedAt(),
                product.getUpdatedAt());
    }
}
