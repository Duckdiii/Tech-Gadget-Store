package com.project.tech_gadget_store.exception;

public class OrderSaveException extends RuntimeException {

    public OrderSaveException(String message) {
        super(message);
    }

    public OrderSaveException(String message, Throwable cause) {
        super(message, cause);
    }
}
