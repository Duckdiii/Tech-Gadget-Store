package com.project.tech_gadget_store.common.exception;

public class ProductVariantInUseException extends RuntimeException {

    public ProductVariantInUseException(String message) {
        super(message);
    }
}
