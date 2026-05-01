package com.project.tech_gadget_store.dto.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CartResponse(// DTO response cho giỏ hàng, bao gồm thông tin đơn hàng và danh sách item trong
                           // giỏ
                UUID orderId,
                List<CartItemResponse> items,
                BigDecimal subtotal,
                BigDecimal discountAmount,
                BigDecimal shippingFee,
                BigDecimal totalAmount,
                String orderStatus,
                String paymentStatus) {
}
