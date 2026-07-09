package com.project.tech_gadget_store.modules.payment.dto.response;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;



@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentMethodRevenueDto {
    private String paymentMethodName;
    private String paymentMethodType; // MOMO, VNPAY, COD, UNKNOWN
    private BigDecimal revenue;
}
