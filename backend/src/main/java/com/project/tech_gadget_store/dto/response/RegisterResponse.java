package com.project.tech_gadget_store.dto.response;

//record tự động có sẵn constructor, getter, equals, hashCode, toString

public record RegisterResponse(
                String id,
                String email,
                String fullName,
                String role,
                String message) {
}
