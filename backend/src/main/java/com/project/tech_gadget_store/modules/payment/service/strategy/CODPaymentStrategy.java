package com.project.tech_gadget_store.modules.payment.service.strategy;

import com.project.tech_gadget_store.common.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.modules.order.entity.Order;
import com.project.tech_gadget_store.modules.payment.dto.request.PaymentConfirmRequestDto;
import com.project.tech_gadget_store.modules.payment.dto.response.PaymentConfirmResponseDto;
import com.project.tech_gadget_store.modules.payment.entity.CODPaymentMethod;
import com.project.tech_gadget_store.modules.payment.entity.PaymentLog;
import com.project.tech_gadget_store.modules.payment.repository.CODPaymentMethodRepository;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;



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
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phương thức thanh toán"));

        if (!codMethod.isAmountAllowed(amount)) {
            throw new IllegalArgumentException("Giá trị đơn hàng vượt quá giới hạn cho phép của COD");
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
