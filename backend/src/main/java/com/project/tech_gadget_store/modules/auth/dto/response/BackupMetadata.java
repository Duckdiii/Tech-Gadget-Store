package com.project.tech_gadget_store.modules.auth.dto.response;

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
public class BackupMetadata {
    private String backupName;
    private LocalDateTime timestamp;
    private String appVersion;
    private String checksum;
    private Long sizeBytes;
}
