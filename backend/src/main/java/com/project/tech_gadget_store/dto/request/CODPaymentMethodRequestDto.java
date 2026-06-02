package com.project.tech_gadget_store.dto.request;

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

    private BigDecimal maxAmount;
    private BigDecimal serviceFee;
}
