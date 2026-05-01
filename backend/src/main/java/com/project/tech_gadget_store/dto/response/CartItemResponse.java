package com.project.tech_gadget_store.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record CartItemResponse( // Dùng record để tạo DTO response cho item trong giỏ hàng
                UUID orderItemId,
                UUID variantId,
                String productName,
                String variantName,
                String imageUrl,
                Integer quantity,
                BigDecimal unitPrice,
                BigDecimal subTotal) {
}
