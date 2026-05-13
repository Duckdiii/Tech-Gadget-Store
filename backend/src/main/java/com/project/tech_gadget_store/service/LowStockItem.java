package com.project.tech_gadget_store.service;

import java.util.UUID;

public record LowStockItem(
        UUID variantId,
        UUID productId,
        String variantName,
        Integer stockQuantity,
        Integer threshold) {
}
