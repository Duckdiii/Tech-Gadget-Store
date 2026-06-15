package com.project.tech_gadget_store.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponseDto {
    private String token;
    private String email;
    private String fullName;
    private String role;
}
