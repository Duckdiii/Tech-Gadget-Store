package com.project.tech_gadget_store.service;

import java.math.BigDecimal;
import java.util.UUID;

public record TopProductItem(
        UUID productId,
        String productName,
        UUID variantId,
        String variantName,
        Long soldQuantity,
        BigDecimal revenue) {
}
