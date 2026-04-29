package com.project.tech_gadget_store.exception;

import org.springframework.http.HttpStatus;

// DÃ¹ng khi táº¡o tÃ i khoáº£n trÃ¹ng Email, trÃ¹ng SKU...
public class ConflictException extends BaseBusinessException {
    public ConflictException(String message) {
        super(message, HttpStatus.CONFLICT);
    }
}
