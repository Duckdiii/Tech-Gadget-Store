package com.project.tech_gadget_store.modules.order.dto.response;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderListStatsDto {
    private long pendingCount;
    private long shippingCount;
    private BigDecimal todayRevenue;
    private double cancellationRate;
}
