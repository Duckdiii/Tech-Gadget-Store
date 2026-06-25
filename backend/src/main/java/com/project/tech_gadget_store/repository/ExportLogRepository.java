package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.ExportLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExportLogRepository extends JpaRepository<ExportLog, String> {
}
