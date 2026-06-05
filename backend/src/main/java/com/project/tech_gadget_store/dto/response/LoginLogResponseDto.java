package com.project.tech_gadget_store.dto.response;

import com.project.tech_gadget_store.entity.enums.LoginStatus;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginLogResponseDto {

    private String id;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String accountId;
    private String email;
    private String roleName;
    private LoginStatus loginStatus;
    private LocalDateTime loginTime;
    private String ipAddress;
}
