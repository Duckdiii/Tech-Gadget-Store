package com.project.tech_gadget_store.dto.request;

import com.project.tech_gadget_store.entity.enums.AccountStatus;
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
public class AccountRequestDto {

    private String email;
    private String password;
    private AccountStatus status;
    private LocalDateTime lastLoginAt;
    private String userId;
}
