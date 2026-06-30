package com.project.tech_gadget_store.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class SupplierResponseDto {

    private String id;
    private String name;
    private String phone;
    private String email;
    private String address;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
