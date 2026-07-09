package com.project.tech_gadget_store.modules.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import java.util.List;
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
public class RestoreRequestDto {

    @NotBlank(message = "Backup name is required")
    private String backupName;

    @NotBlank(message = "Restore scope is required (FULL or PARTIAL)")
    private String scope;

    private List<String> modules;
}
