package com.project.tech_gadget_store.modules.warehouse.dto.response;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;



@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueTrendPointDto {
    private String label;
    private BigDecimal revenue;
    private long orderCount;

    public RevenueTrendPointDto(String label, BigDecimal revenue) {
        this.label = label;
        this.revenue = revenue;
        this.orderCount = 0;
    }
}
