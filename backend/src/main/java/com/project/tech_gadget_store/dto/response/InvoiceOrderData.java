package com.project.tech_gadget_store.dto.response;

import com.project.tech_gadget_store.entity.OrderItem;

import java.util.List;

public record InvoiceOrderData(
        String orderCode,
        String receiverName,
        java.time.OffsetDateTime createdAt,
        java.math.BigDecimal totalAmount,
        List<OrderItem> items) {
}