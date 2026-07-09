package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.ImportLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface ImportLogRepository extends JpaRepository<ImportLog, String> {

    List<ImportLog> findAllByOrderByImportedAtDesc();

    List<ImportLog> findByImportedAtBetween(LocalDateTime start, LocalDateTime end);

    Page<ImportLog> findAllByOrderByImportedAtDesc(Pageable pageable);
}
