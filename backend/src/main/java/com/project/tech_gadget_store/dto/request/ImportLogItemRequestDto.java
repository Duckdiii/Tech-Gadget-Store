package com.project.tech_gadget_store.dto.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
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
public class ImportLogItemRequestDto {

    @NotBlank(message = "productVariantId must not be blank")
    private String productVariantId;
    @NotNull(message = "quantity must not be null")
    @Positive(message = "quantity must be positive")
    private Integer quantity;
    @NotNull(message = "importPrice must not be null")
    @DecimalMin(value = "0.00", message = "importPrice must not be negative")
    private BigDecimal importPrice;
}
