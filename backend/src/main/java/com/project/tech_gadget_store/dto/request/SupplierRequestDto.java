package com.project.tech_gadget_store.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SupplierRequestDto {

    @NotBlank(message = "Name is required")
    private String name;

    private String phone;

    @Email(message = "Email must be valid")
    private String email;

    private String address;
}
