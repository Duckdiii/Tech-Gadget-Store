package com.project.tech_gadget_store.exception;

public class InventoryUpdateException extends RuntimeException {

    public InventoryUpdateException(String message) {
        super(message);
    }

    public InventoryUpdateException(String message, Throwable cause) {
        super(message, cause);
    }
}
