package com.project.tech_gadget_store.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportLogItemResponseDto {

    private String id;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String importLogId;
    private String productVariantId;
    private Integer quantity;
    private BigDecimal importPrice;
}
