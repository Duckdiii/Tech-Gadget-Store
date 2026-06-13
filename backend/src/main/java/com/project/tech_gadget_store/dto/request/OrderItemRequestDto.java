package com.project.tech_gadget_store.dto.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
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
public class OrderItemRequestDto {

    @NotBlank(message = "orderId must not be blank")
    private String orderId;
    @NotBlank(message = "productVariantId must not be blank")
    private String productVariantId;
    @NotNull(message = "quantity must not be null")
    @Positive(message = "quantity must be positive")
    private Integer quantity;
    @Size(max = 2, message = "bundleServicesIds must contain at most 2 items")
    private List<String> bundleServicesIds;
    @NotNull(message = "unitPriceAtOrder must not be null")
    @DecimalMin(value = "0.00", message = "unitPriceAtOrder must not be negative")
    private BigDecimal unitPriceAtOrder;
}
