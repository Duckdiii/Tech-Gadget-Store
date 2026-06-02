package com.project.tech_gadget_store.dto.response;

import com.project.tech_gadget_store.entity.enums.AuditAction;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponseDto {

    private String id;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String actorId;
    private AuditAction action;
    private String targetType;
    private String targetId;
    private String description;
}
