package com.project.tech_gadget_store.dto.response;

import com.project.tech_gadget_store.entity.enums.AccountStatus;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountResponseDto {

    private String id;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String email;
    private String password;
    private AccountStatus status;
    private LocalDateTime lastLoginAt;
    private String userId;
    private List<String> loginLogsIds;
}
