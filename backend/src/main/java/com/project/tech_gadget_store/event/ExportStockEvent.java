package com.project.tech_gadget_store.event;

import lombok.Getter;

@Getter
public class ExportStockEvent {
    private final String performedBy;
    private final boolean success;
    private final String reason;

    public ExportStockEvent(String performedBy, boolean success, String reason) {
        this.performedBy = performedBy;
        this.success = success;
        this.reason = reason;
    }
}
