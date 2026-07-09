package com.project.tech_gadget_store.modules.loyalty.dto.response;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;



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
