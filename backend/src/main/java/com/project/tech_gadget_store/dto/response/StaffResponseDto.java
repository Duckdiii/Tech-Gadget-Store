package com.project.tech_gadget_store.dto.response;

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
public class StaffResponseDto {

    private String id;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String fullName;
    private String phone;
    private String staffCode;
    private LocalDate hireDate;
    private String email;
    private String accountId;
}
