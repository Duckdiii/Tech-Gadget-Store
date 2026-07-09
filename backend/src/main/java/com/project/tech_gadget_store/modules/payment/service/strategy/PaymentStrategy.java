package com.project.tech_gadget_store.modules.payment.service.strategy;

import com.project.tech_gadget_store.modules.order.entity.Order;
import com.project.tech_gadget_store.modules.payment.dto.request.PaymentConfirmRequestDto;
import com.project.tech_gadget_store.modules.payment.dto.response.PaymentConfirmResponseDto;
import com.project.tech_gadget_store.modules.payment.entity.PaymentLog;
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
