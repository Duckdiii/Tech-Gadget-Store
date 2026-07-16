package com.project.tech_gadget_store.modules.payment.dto.response;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PreferredPaymentMethodResponseDto {
    private List<PaymentMethodResponseDto> available;
    private String preferred;
}
