package com.project.tech_gadget_store.dto.request;

import com.project.tech_gadget_store.entity.enums.AuditAction;
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
public class AuditLogRequestDto {

    private String actorId;
    private AuditAction action;
    private String targetType;
    private String targetId;
    private String description;
}
