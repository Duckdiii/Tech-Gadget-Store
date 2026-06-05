package com.project.tech_gadget_store.dto.request;

import com.project.tech_gadget_store.entity.enums.LoginStatus;
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

    private String accountId;
    private String email;
    private String roleName;
    private LoginStatus loginStatus;
    private LocalDateTime loginTime;
    private String ipAddress;
}
