package com.project.tech_gadget_store.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentMethodRevenueDto {
    private String paymentMethodName;
    private String paymentMethodType; // MOMO, VNPAY, COD, UNKNOWN
    private BigDecimal revenue;
}
