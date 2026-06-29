package com.project.tech_gadget_store.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class PurchaseOrderRequestDto {

    @NotBlank(message = "supplierId is required")
    private String supplierId;

    @NotBlank(message = "orderedBy is required")
    private String orderedBy;

    private String note;

    @NotEmpty(message = "items must not be empty")
    @Valid
    private List<PurchaseOrderItemRequestDto> items;
}
