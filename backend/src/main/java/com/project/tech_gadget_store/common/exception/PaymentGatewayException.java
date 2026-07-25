package com.project.tech_gadget_store.common.exception;

/** Thrown when an external payment gateway (Momo, VNPay...) is unreachable or returns an unusable response. */
public class PaymentGatewayException extends RuntimeException {

    public PaymentGatewayException(String message) {
        super(message);
    }
}
