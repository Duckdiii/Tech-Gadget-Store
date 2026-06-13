package com.project.tech_gadget_store.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

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
public class ItemInventoryRequestDto {

    @NotBlank(message = "inventoryId must not be blank")
    private String inventoryId;
    @NotBlank(message = "productVariantId must not be blank")
    private String productVariantId;
    @NotNull(message = "quantity must not be null")
    @Positive(message = "quantity must be positive")
    private Integer quantity;
    @Min(value = 0, message = "reservedQuantity must not be negative")
    private Integer reservedQuantity;
}
