package com.project.tech_gadget_store.dto.request;

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
public class CartItemRequestDto {

    @NotBlank(message = "cartId must not be blank")
    private String cartId;
    @NotBlank(message = "productVariantId must not be blank")
    private String productVariantId;
    @NotNull(message = "quantity must not be null")
    @Positive(message = "quantity must be positive")
    private Integer quantity;
    private Boolean isSelectedForCheckout;
    @Size(max = 2, message = "bundleServicesIds must contain at most 2 items")
    private List<String> bundleServicesIds;
}
