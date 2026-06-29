package com.project.tech_gadget_store.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class PurchaseOrderItemRequestDto {

    @NotBlank(message = "productVariantId is required")
    private String productVariantId;

    @NotNull(message = "quantity is required")
    @Min(value = 1, message = "quantity must be at least 1")
    private Integer quantity;

    @NotNull(message = "unitPrice is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "unitPrice must be greater than 0")
    private BigDecimal unitPrice;
}
