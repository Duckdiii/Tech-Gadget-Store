package com.project.tech_gadget_store.exception;

public class ProductVariantInUseException extends RuntimeException {

    public ProductVariantInUseException(String message) {
        super(message);
    }
}
