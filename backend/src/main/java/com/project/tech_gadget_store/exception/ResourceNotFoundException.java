package com.project.tech_gadget_store.exception;

import org.springframework.http.HttpStatus;

// DÃ¹ng khi khÃ´ng tÃ¬m tháº¥y Sáº£n pháº©m, User, ÄÆ¡n hÃ ng...
public class ResourceNotFoundException extends BaseBusinessException {
    public ResourceNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND);
    }
}
