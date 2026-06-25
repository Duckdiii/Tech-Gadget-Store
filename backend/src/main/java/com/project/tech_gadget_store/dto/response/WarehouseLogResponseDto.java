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
public class WarehouseLogResponseDto {
    private String logId;
    private String logItemId;
    private String type; // "IMPORT" or "EXPORT"
    private String productName;
    private Integer quantity;
    private String performedBy;
    private String status;
    private LocalDateTime createdTime;
    private BigDecimal price;
    private String noteOrReason;
    private String productDetails;
}
