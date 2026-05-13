package com.project.tech_gadget_store.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record InventoryLogResponse(
        UUID id,
        UUID variantId,
        String changeType, // IMPORT, SELL, CANCEL, ADJUST
        Integer quantityChanged,
        Integer stockAfter,
        BigDecimal unitPrice,
        String referenceId, // orderId or receiptId
        String note,
        LocalDateTime createdAt) {
}
