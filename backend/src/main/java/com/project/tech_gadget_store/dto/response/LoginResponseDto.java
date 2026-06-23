package com.project.tech_gadget_store.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Builder;

@Getter
@Builder
@NoArgsConstructor

@AllArgsConstructor
public class LoginResponseDto {
    private String token;
    private String email;
    private String fullName;
    private String role;
}
