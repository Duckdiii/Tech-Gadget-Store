package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.ImportLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface ImportLogRepository extends JpaRepository<ImportLog, String> {

    List<ImportLog> findAllByOrderByImportedAtDesc();

    List<ImportLog> findByImportedAtBetween(LocalDateTime start, LocalDateTime end);

    Page<ImportLog> findAllByOrderByImportedAtDesc(Pageable pageable);

    @Query("SELECT il FROM ImportLog il WHERE " +
           "(:cursorTimestamp IS NULL OR il.importedAt < :cursorTimestamp OR " +
           "(il.importedAt = :cursorTimestamp AND il.id < :cursorId)) " +
           "ORDER BY il.importedAt DESC, il.id DESC")
    List<ImportLog> findImportLogsCursor(
            @Param("cursorTimestamp") LocalDateTime cursorTimestamp,
            @Param("cursorId") String cursorId,
            Pageable pageable);
}
