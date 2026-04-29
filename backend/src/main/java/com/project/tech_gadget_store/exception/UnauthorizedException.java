package com.project.tech_gadget_store.exception;

import org.springframework.http.HttpStatus;

// DÃ¹ng khi chÆ°a Ä‘Äƒng nháº­p, sai password...
public class UnauthorizedException extends BaseBusinessException {
    public UnauthorizedException(String message) {
        super(message, HttpStatus.UNAUTHORIZED);
    }
}
