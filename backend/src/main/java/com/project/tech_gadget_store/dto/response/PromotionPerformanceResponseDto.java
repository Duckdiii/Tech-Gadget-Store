package com.project.tech_gadget_store.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromotionPerformanceResponseDto {

    private String promotionId;
    private String code;
    private String name;
    private Double discountPercent;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private Boolean active;
    private String status;
    private int productCount;
    private long orderCount;
    private BigDecimal estimatedRevenue;
    private BigDecimal estimatedDiscountAmount;
}
