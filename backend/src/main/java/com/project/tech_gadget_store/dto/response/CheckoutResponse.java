package com.project.tech_gadget_store.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record CheckoutResponse( // DTO response cho kết quả thanh toán đơn hàng
                UUID orderId,
                String orderStatus,
                String paymentStatus,
                BigDecimal totalAmount,
                String paymentUrl) {
}
