package com.project.tech_gadget_store.modules.notification.event;

import lombok.Getter;


@Getter
public class ImportStockEvent {
    private final String performedBy;
    private final boolean success;
    private final String note;

    public ImportStockEvent(String performedBy, boolean success, String note) {
        this.performedBy = performedBy;
        this.success = success;
        this.note = note;
    }
}
