package com.project.tech_gadget_store.dto.response;

import com.project.tech_gadget_store.entity.enums.POStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class SupplyOrderResponseDto {

    private String id;
    private String supplierId;
    private String supplierName;
    private POStatus status;
    private LocalDate orderDate;
    private String notes;
    private List<SupplyOrderItemResponseDto> items;
    private BigDecimal totalValue;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
