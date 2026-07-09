package com.project.tech_gadget_store.strategy;

import com.project.tech_gadget_store.dto.request.PaymentConfirmRequestDto;
import com.project.tech_gadget_store.dto.response.PaymentConfirmResponseDto;
import com.project.tech_gadget_store.entity.CODPaymentMethod;
import com.project.tech_gadget_store.entity.Order;
import com.project.tech_gadget_store.entity.PaymentLog;
import com.project.tech_gadget_store.repository.CODPaymentMethodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class CODPaymentStrategy implements PaymentStrategy {

    private final CODPaymentMethodRepository codMethodRepository;

    @Override
    public boolean supports(String paymentMethodId) {
        return codMethodRepository.existsById(paymentMethodId);
    }

    @Override
    public PaymentConfirmResponseDto initiatePayment(
            Order order,
            PaymentLog paymentLog,
            BigDecimal amount,
            PaymentConfirmRequestDto req,
            String clientIp
    ) {
        CODPaymentMethod codMethod = codMethodRepository.findById(req.getPaymentMethodId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy phương thức thanh toán"));

        if (!codMethod.isAmountAllowed(amount)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giá trị đơn hàng vượt quá giới hạn cho phép của COD");
        }

        return PaymentConfirmResponseDto.builder()
                .paymentMethod("COD")
                .status("PENDING")
                .orderId(order.getId())
                .paymentLogId(paymentLog.getId())
                .message("Đặt hàng COD thành công, chờ xác nhận")
                .build();
    }
}
