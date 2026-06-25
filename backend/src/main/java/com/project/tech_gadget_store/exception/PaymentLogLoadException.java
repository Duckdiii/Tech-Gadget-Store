package com.project.tech_gadget_store.exception;

public class PaymentLogLoadException extends RuntimeException {
    public PaymentLogLoadException(String message) {
        super(message);
    }
    
    public PaymentLogLoadException(String message, Throwable cause) {
        super(message, cause);
    }
}
