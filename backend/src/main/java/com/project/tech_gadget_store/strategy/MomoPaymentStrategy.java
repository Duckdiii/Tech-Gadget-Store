package com.project.tech_gadget_store.strategy;

import com.project.tech_gadget_store.dto.request.PaymentConfirmRequestDto;
import com.project.tech_gadget_store.dto.response.PaymentConfirmResponseDto;
import com.project.tech_gadget_store.entity.Order;
import com.project.tech_gadget_store.entity.PaymentLog;
import com.project.tech_gadget_store.repository.MomoPaymentMethodRepository;
import com.project.tech_gadget_store.service.MomoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;

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
                    .message("Khởi tạo thanh toán online thành công, chuyển hướng người dùng")
                    .build();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi khởi tạo thanh toán: " + e.getMessage(), e);
        }
    }
}
