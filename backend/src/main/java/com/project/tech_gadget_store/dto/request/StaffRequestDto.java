package com.project.tech_gadget_store.dto.request;

import jakarta.validation.constraints.*;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffRequestDto {

    @NotBlank(message = "fullName must not be blank")
    private String fullName;

    @NotBlank(message = "phone must not be blank")
    @Pattern(regexp = "^[0-9]{10,11}$", message = "phone must be a valid 10-11 digit number")
    private String phone;

    @NotBlank(message = "staffCode must not be blank")
    private String staffCode;

    @NotNull(message = "hireDate must not be null")
    private LocalDate hireDate;

    @NotBlank(message = "email must not be blank")
    @Email(message = "email must be a valid email address")
    private String email;

    @NotBlank(message = "password must not be blank")
    @Size(min = 6, message = "password must be at least 6 characters")
    private String password;
}
