package com.project.tech_gadget_store.service.event;

import java.util.UUID;

public record OrderEvent(
                UUID orderId,
                UUID accountId,
                OrderEventType eventType,
                String orderStatus,
                String paymentStatus) {
}
