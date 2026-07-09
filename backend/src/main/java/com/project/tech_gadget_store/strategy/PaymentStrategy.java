package com.project.tech_gadget_store.strategy;

import com.project.tech_gadget_store.dto.request.PaymentConfirmRequestDto;
import com.project.tech_gadget_store.dto.response.PaymentConfirmResponseDto;
import com.project.tech_gadget_store.entity.Order;
import com.project.tech_gadget_store.entity.PaymentLog;

import java.math.BigDecimal;

public interface PaymentStrategy {
    boolean supports(String paymentMethodId);
    PaymentConfirmResponseDto initiatePayment(
            Order order,
            PaymentLog paymentLog,
            BigDecimal amount,
            PaymentConfirmRequestDto req,
            String clientIp
    );
}
