package com.project.tech_gadget_store.dto.response;

import com.project.tech_gadget_store.entity.enums.ImportAndExportStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExportLogResponseDto {

    private String id;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ExportLogItemResponseDto> items;
    private LocalDateTime exportedAt;
    private String reason;
    private ImportAndExportStatus status;
    private String performedById;
    private String receiptId;
    private Integer totalQuantity;
    private BigDecimal totalValue;
    private String message;
}
