package com.project.tech_gadget_store.dto.response;

import com.project.tech_gadget_store.entity.enums.PurchaseOrderStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class PurchaseOrderResponseDto {

    private String id;
    private String supplierId;
    private String supplierName;
    private String orderedBy;
    private LocalDateTime orderedAt;
    private PurchaseOrderStatus status;
    private String note;
    private List<PurchaseOrderItemResponseDto> items;
    private BigDecimal totalValue;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
