package com.project.tech_gadget_store.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromotionSummaryResponseDto {

    private long activeCount;
    private long totalCount;
    private long totalOrderCount;
    private BigDecimal totalEstimatedRevenue;
}
