package com.project.tech_gadget_store.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AuditLog extends BaseEntity {

    @Column(name = "performed_by", nullable = false, length = 120)
    private String performedBy;

    @Column(name = "action", nullable = false, length = 50)
    private String action;

    @Column(name = "details", columnDefinition = "TEXT")
    private String details;

    public AuditLog(String performedBy, String action, String details) {
        if (performedBy == null || performedBy.isBlank()) {
            throw new IllegalArgumentException("performedBy must not be blank");
        }
        if (action == null || action.isBlank()) {
            throw new IllegalArgumentException("action must not be blank");
        }
        this.performedBy = performedBy;
        this.action = action;
        this.details = details;
    }
}
