package com.project.tech_gadget_store.modules.catalog.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WarrantyResponseDto {
    private String serialNumber;
    private String status;
    private String productName;
    private String productVariantId;
    private LocalDateTime purchaseDate;
    private LocalDateTime warrantyEndDate;
    private Boolean isUnderWarranty;
}
