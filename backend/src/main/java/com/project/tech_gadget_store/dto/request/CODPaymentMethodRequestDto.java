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
public class CODPaymentMethodRequestDto {

    @NotNull(message = "maxAmount must not be null")
    @DecimalMin(value = "0.00", message = "maxAmount must not be negative")
    private BigDecimal maxAmount;
    @NotNull(message = "serviceFee must not be null")
    @DecimalMin(value = "0.00", message = "serviceFee must not be negative")
    private BigDecimal serviceFee;
}
