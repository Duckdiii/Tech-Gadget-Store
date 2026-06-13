package com.project.tech_gadget_store.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import com.project.tech_gadget_store.entity.enums.ImportAndExportStatus;
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

    @Valid
    @NotEmpty(message = "items must not be empty")
    private List<ImportLogItemRequestDto> items;
    @NotBlank(message = "performedById must not be blank")
    private String performedById;
    private LocalDateTime importedAt;
    @NotNull(message = "status must not be null")
    private ImportAndExportStatus status;
    private String note;
}
