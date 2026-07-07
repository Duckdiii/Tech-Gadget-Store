package com.project.tech_gadget_store.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

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
