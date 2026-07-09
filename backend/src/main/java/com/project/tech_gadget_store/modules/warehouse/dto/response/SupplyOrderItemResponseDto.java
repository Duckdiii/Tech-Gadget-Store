package com.project.tech_gadget_store.modules.warehouse.dto.response;

import java.math.BigDecimal;
import lombok.Builder;
import lombok.Getter;



@Getter
@Builder
public class SupplyOrderItemResponseDto {

    private String id;
    private String productVariantId;
    private String productName;
    private String variantLabel;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;
}
