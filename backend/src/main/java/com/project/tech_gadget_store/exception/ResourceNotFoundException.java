package com.project.tech_gadget_store.exception;

import org.springframework.http.HttpStatus;

// Dùng khi không tìm thấy tài nguyên, ví dụ: tìm sản phẩm theo ID mà không có, tìm danh mục theo ID mà không có...
public class ResourceNotFoundException extends BaseBusinessException {
    public ResourceNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND);
    }
}
