package com.project.tech_gadget_store.service;

import java.math.BigDecimal;
import java.util.UUID;

public record TopCustomerItem(
                UUID customerId,
                String customerName,
                Long totalOrders,
                BigDecimal totalSpent) {
}
