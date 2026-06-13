package com.project.tech_gadget_store.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import com.project.tech_gadget_store.entity.enums.AccountStatus;
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
public class AccountRequestDto {

    @NotBlank(message = "email must not be blank")
    @Email(message = "email must be valid")
    private String email;
    @NotBlank(message = "password must not be blank")
    private String password;
    @NotNull(message = "status must not be null")
    private AccountStatus status;
    @NotBlank(message = "userId must not be blank")
    private String userId;
}
