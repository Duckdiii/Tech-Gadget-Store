package com.project.tech_gadget_store.dto.request;

import jakarta.validation.Valid;
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
public class ProductVariantRequestDto {

    @NotBlank(message = "productId must not be blank")
    private String productId;
    @NotNull(message = "ramGb must not be null")
    @Positive(message = "ramGb must be positive")
    private Integer ramGb;
    @NotNull(message = "storageGb must not be null")
    @Positive(message = "storageGb must be positive")
    private Integer storageGb;
    @NotBlank(message = "color must not be blank")
    private String color;
    @NotNull(message = "price must not be null")
    @DecimalMin(value = "0.00", message = "price must not be negative")
    private BigDecimal price;
}
