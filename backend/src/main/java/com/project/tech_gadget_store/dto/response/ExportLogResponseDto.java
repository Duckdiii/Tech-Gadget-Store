package com.project.tech_gadget_store.dto.response;

import com.project.tech_gadget_store.entity.enums.ImportAndExportStatus;
import java.time.LocalDateTime;
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
    private String productId;
    private Integer quantity;
    private LocalDateTime exportedAt;
    private String reason;
    private ImportAndExportStatus status;
    private String performedById;
    private String receiptId;
}
