package com.project.tech_gadget_store.dto.response;

import com.project.tech_gadget_store.entity.Promotion;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record PromotionResponse(
        UUID id,
        String name,
        String description,
        String discountType,
        BigDecimal discountValue,
        OffsetDateTime startDate,
        OffsetDateTime endDate,
        Boolean isActive,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt) {

    public static PromotionResponse fromEntity(Promotion promotion) {
        return new PromotionResponse(
                promotion.getId(),
                promotion.getName(),
                promotion.getDescription(),
                promotion.getDiscountType(),
                promotion.getDiscountValue(),
                promotion.getStartDate(),
                promotion.getEndDate(),
                promotion.getIsActive(),
                promotion.getCreatedAt(),
                promotion.getUpdatedAt());
    }
}
