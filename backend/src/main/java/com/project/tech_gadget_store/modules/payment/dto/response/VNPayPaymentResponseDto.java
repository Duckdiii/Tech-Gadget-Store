package com.project.tech_gadget_store.modules.payment.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;


@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VNPayPaymentResponseDto {

    private String paymentUrl;
    private String orderId;
}
