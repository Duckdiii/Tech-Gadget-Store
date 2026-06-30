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
public class SupplyOrderRequestDto {

    @NotBlank(message = "supplierId is required")
    private String supplierId;

    private String notes;

    @NotEmpty(message = "items must not be empty")
    @Valid
    private List<SupplyOrderItemRequestDto> items;
}
