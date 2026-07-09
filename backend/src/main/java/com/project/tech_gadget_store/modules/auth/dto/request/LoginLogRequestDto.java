package com.project.tech_gadget_store.modules.auth.dto.request;

import com.project.tech_gadget_store.modules.auth.entity.enums.LoginStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
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
public class LoginLogRequestDto {

    @NotBlank(message = "accountId must not be blank")
    private String accountId;
    @NotBlank(message = "email must not be blank")
    @Email(message = "email must be valid")
    private String email;
    @NotBlank(message = "roleName must not be blank")
    private String roleName;
    @NotNull(message = "loginStatus must not be null")
    private LoginStatus loginStatus;
    private LocalDateTime loginTime;
}
