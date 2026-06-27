package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, String> {
}
