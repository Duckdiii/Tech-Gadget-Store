package com.project.tech_gadget_store.dto.response;

public record LoginResponse(
        String accessToken,
        String tokenType,
        String email,
        String role) {
}
