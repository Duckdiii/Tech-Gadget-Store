package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.ImportLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImportLogRepository extends JpaRepository<ImportLog, String> {

    List<ImportLog> findAllByOrderByImportedAtDesc();
}
