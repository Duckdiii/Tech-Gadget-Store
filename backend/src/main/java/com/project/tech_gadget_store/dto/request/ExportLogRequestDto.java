package com.project.tech_gadget_store.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

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
public class ExportLogRequestDto {

    @Valid
    @NotEmpty(message = "items must not be empty")
    private List<ExportLogItemRequestDto> items;

    private String reason;

    @NotBlank(message = "performedById must not be blank")
    private String performedById;
}
