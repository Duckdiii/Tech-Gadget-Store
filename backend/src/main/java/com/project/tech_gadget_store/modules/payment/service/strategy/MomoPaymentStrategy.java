package com.project.tech_gadget_store.modules.payment.service.strategy;

import com.project.tech_gadget_store.common.constants.ErrorMessages;
import com.project.tech_gadget_store.common.exception.PaymentInitializationException;
import com.project.tech_gadget_store.modules.order.entity.Order;
import com.project.tech_gadget_store.modules.payment.dto.request.PaymentConfirmRequestDto;
import com.project.tech_gadget_store.modules.payment.dto.response.PaymentConfirmResponseDto;
import com.project.tech_gadget_store.modules.payment.entity.PaymentLog;
import com.project.tech_gadget_store.modules.payment.repository.MomoPaymentMethodRepository;
import com.project.tech_gadget_store.modules.payment.service.MomoService;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;



@Component
@RequiredArgsConstructor
public class MomoPaymentStrategy implements PaymentStrategy {

    private final MomoPaymentMethodRepository momoMethodRepository;
    private final MomoService momoService;

    @Override
    public boolean supports(String paymentMethodId) {
        return momoMethodRepository.existsById(paymentMethodId);
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
            String redirectUrl = momoService.createPayment(paymentLog.getId(), amount, req.getOrderInfo());

            return PaymentConfirmResponseDto.builder()
                    .paymentMethod("MOMO")
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
