package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.ExportLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ExportLogRepository extends JpaRepository<ExportLog, String> {

    List<ExportLog> findByExportedAtBetween(LocalDateTime start, LocalDateTime end);

    Page<ExportLog> findAllByOrderByExportedAtDesc(Pageable pageable);
}
