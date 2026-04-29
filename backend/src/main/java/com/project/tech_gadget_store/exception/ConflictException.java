package com.project.tech_gadget_store.exception;

import org.springframework.http.HttpStatus;

// Dùng khi tạo tài khoản trùng Email, trùng SKU...
public class ConflictException extends BaseBusinessException {
    public ConflictException(String message) {
        super(message, HttpStatus.CONFLICT);
    }
}
