package com.project.tech_gadget_store.service;

import java.math.BigDecimal;

public record TimeSeriesPoint(
                String label, // e.g., date, hour, etc.
                BigDecimal value) {// e.g., total revenue, total orders, etc.
}
