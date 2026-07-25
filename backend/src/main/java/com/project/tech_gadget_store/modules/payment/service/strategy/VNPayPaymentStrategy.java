package com.project.tech_gadget_store.modules.payment.service.strategy;

import com.project.tech_gadget_store.common.constants.ErrorMessages;
import com.project.tech_gadget_store.common.exception.PaymentInitializationException;
import com.project.tech_gadget_store.modules.order.entity.Order;
import com.project.tech_gadget_store.modules.payment.dto.request.PaymentConfirmRequestDto;
import com.project.tech_gadget_store.modules.payment.dto.response.PaymentConfirmResponseDto;
import com.project.tech_gadget_store.modules.payment.entity.PaymentLog;
import com.project.tech_gadget_store.modules.payment.repository.VNPayPaymentMethodRepository;
import com.project.tech_gadget_store.modules.payment.service.VNPayService;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;



@Component
@RequiredArgsConstructor
public class VNPayPaymentStrategy implements PaymentStrategy {

    private final VNPayPaymentMethodRepository vnpayMethodRepository;
    private final VNPayService vnpayService;

    @Override
    public boolean supports(String paymentMethodId) {
        return vnpayMethodRepository.existsById(paymentMethodId);
    }

    @Override
    public PaymentConfirmResponseDto initiatePayment(
            Order order,
            PaymentLog paymentLog,
            BigDecimal amount,
            PaymentConfirmRequestDto req,
            String clientIp
    ) {
        try {
            String redirectUrl = vnpayService.buildPaymentUrl(paymentLog.getId(), amount, clientIp, req.getOrderInfo());

            return PaymentConfirmResponseDto.builder()
                    .paymentMethod("VNPAY")
                    .status("PENDING")
                    .redirectUrl(redirectUrl)
                    .paymentLogId(paymentLog.getId())
                    .message(ErrorMessages.PAYMENT_INITIATED_REDIRECT)
                    .build();
        } catch (Exception e) {
            throw new PaymentInitializationException(ErrorMessages.PAYMENT_INITIALIZATION_FAILED_PREFIX + e.getMessage(), e);
        }
    }
}
