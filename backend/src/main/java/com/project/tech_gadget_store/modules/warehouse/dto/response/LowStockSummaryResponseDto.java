package com.project.tech_gadget_store.modules.warehouse.dto.response;

import java.util.List;
import lombok.Builder;
import lombok.Getter;



@Getter
@Builder
public class LowStockSummaryResponseDto {

    private long totalCount;
    private long threshold;
    private List<LowStockProductResponseDto> items;
}
