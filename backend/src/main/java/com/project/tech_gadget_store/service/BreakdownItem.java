package com.project.tech_gadget_store.service;

import java.math.BigDecimal;

public record BreakdownItem(
                String key, // e.g., category name, payment method, etc.
                Long count, // e.g., number of orders, number of products sold, etc.
                BigDecimal amount, // e.g., total revenue, total cost, etc.
                Double percent) {// e.g., percentage of total revenue, percentage of total orders, etc.
}
