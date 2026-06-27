package com.project.tech_gadget_store.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

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
