package com.project.tech_gadget_store.modules.auth.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;



@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyProfileResponseDto {

    private String id;
    private String fullName;
    private String email;
    private String role;
    private String staffCode;
    private LocalDate hireDate;
    private LocalDateTime lastLoginAt;
}
