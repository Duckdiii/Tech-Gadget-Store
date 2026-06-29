package com.project.tech_gadget_store.mapper;

import com.project.tech_gadget_store.dto.response.PromotionResponseDto;
import com.project.tech_gadget_store.entity.Promotion;
import com.project.tech_gadget_store.entity.Product;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class PromotionMapper {

    public PromotionResponseDto toResponseDto(Promotion promotion) {
        if (promotion == null) return null;
        List<String> productIds = promotion.getProducts().stream()
                .map(Product::getId)
                .toList();
        return PromotionResponseDto.builder()
                .id(promotion.getId())
                .createdAt(promotion.getCreatedAt())
                .updatedAt(promotion.getUpdatedAt())
                .code(promotion.getCode())
                .name(promotion.getName())
                .discountPercent(promotion.getDiscountPercent())
                .startAt(promotion.getStartAt())
                .endAt(promotion.getEndAt())
                .active(promotion.getActive())
                .productIds(productIds)
                .status(computeStatus(promotion))
                .build();
    }

    public String computeStatus(Promotion promotion) {
        if (!Boolean.TRUE.equals(promotion.getActive())) return "ENDED";
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(promotion.getStartAt())) return "UPCOMING";
        if (now.isAfter(promotion.getEndAt())) return "ENDED";
        return "ACTIVE";
    }
}
