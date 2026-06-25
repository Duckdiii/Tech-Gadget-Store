package com.project.tech_gadget_store.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentConfirmResponseDto {
    private String paymentMethod;
    private String status; // "SUCCESS", "PENDING", "FAILED", "CANCELLED"
    private String redirectUrl; // URL for redirecting if MoMo/VNPay
    private String orderId; // created order ID (for COD or completed online)
    private String paymentLogId;
    private String message;
}
