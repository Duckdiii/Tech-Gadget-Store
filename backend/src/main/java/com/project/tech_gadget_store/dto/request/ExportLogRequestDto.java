package com.project.tech_gadget_store.dto.request;

import com.project.tech_gadget_store.entity.enums.ImportAndExportStatus;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExportLogRequestDto {

    private String productId;
    private Integer quantity;
    private LocalDateTime exportedAt;
    private String reason;
    private ImportAndExportStatus status;
    private String performedById;
}
