package com.project.tech_gadget_store.dto.request;

import jakarta.validation.Valid;
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
    private String phone;
    @NotBlank(message = "staffCode must not be blank")
    private String staffCode;
    @NotNull(message = "hireDate must not be null")
    private LocalDate hireDate;
}
