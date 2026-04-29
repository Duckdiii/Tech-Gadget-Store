package com.project.tech_gadget_store.exception;

import org.springframework.http.HttpStatus;

// Dùng khi người dùng không có quyền truy cập, ví dụ: truy cập API mà không có token, hoặc token hết hạn, hoặc token không hợp lệ...
public class UnauthorizedException extends BaseBusinessException {
    public UnauthorizedException(String message) {
        super(message, HttpStatus.UNAUTHORIZED);
    }
}
