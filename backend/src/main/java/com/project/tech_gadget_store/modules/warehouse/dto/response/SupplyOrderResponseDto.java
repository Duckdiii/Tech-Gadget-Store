package com.project.tech_gadget_store.modules.warehouse.dto.response;

import com.project.tech_gadget_store.common.entity.enums.POStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;
import lombok.Getter;



@Getter
@Builder
public class SupplyOrderResponseDto {

    private String id;
    private String supplierId;
    private String supplierName;
    private POStatus status;
    private LocalDate orderDate;
    private LocalDate expectedDeliveryDate;
    private String notes;
    private List<SupplyOrderItemResponseDto> items;
    private BigDecimal totalValue;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
