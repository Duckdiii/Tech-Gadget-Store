package com.project.tech_gadget_store.modules.payment.service.strategy;

import com.project.tech_gadget_store.modules.order.entity.Order;
import com.project.tech_gadget_store.modules.payment.dto.request.PaymentConfirmRequestDto;
import com.project.tech_gadget_store.modules.payment.dto.response.PaymentConfirmResponseDto;
import com.project.tech_gadget_store.modules.payment.entity.PaymentLog;
import com.project.tech_gadget_store.modules.payment.repository.VNPayPaymentMethodRepository;
import com.project.tech_gadget_store.modules.payment.service.VNPayService;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;



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
                    .message("Khởi tạo thanh toán online thành công, chuyển hướng người dùng")
                    .build();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khởi tạo thanh toán: " + e.getMessage(), e);
        }
    }
}
