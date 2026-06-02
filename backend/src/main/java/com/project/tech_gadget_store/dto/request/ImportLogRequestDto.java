package com.project.tech_gadget_store.dto.request;

import com.project.tech_gadget_store.entity.enums.ImportAndExportStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
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
public class ImportLogRequestDto {

    private List<String> productsIds;
    private Integer quantity;
    private String performedById;
    private BigDecimal importPrice;
    private LocalDateTime importedAt;
    private ImportAndExportStatus status;
    private String note;
}
