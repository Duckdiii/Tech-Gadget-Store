package com.project.tech_gadget_store.modules.order.dto.response;

import com.project.tech_gadget_store.modules.payment.dto.response.PaymentMethodResponseDto;
import java.math.BigDecimal;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;


@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutSummaryResponseDto {
    private List<CheckoutItemResponseDto> items;
    private BigDecimal subtotal;
    private BigDecimal discount;
    private BigDecimal vat;
    private BigDecimal total;
    private String membershipTier;
    private List<PaymentMethodResponseDto> availablePaymentMethods;
}
