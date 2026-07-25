package com.project.tech_gadget_store.common.exception;

/** Thrown when building the payment request for a gateway (VNPay, Momo...) fails on our side. */
public class PaymentInitializationException extends RuntimeException {

    public PaymentInitializationException(String message, Throwable cause) {
        super(message, cause);
    }
}
