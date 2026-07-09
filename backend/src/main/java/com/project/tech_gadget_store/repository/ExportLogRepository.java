package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.ExportLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ExportLogRepository extends JpaRepository<ExportLog, String> {

    List<ExportLog> findByExportedAtBetween(LocalDateTime start, LocalDateTime end);

    Page<ExportLog> findAllByOrderByExportedAtDesc(Pageable pageable);

    @Query("SELECT el FROM ExportLog el WHERE " +
           "(:cursorTimestamp IS NULL OR el.exportedAt < :cursorTimestamp OR " +
           "(el.exportedAt = :cursorTimestamp AND el.id < :cursorId)) " +
           "ORDER BY el.exportedAt DESC, el.id DESC")
    List<ExportLog> findExportLogsCursor(
            @Param("cursorTimestamp") LocalDateTime cursorTimestamp,
            @Param("cursorId") String cursorId,
            Pageable pageable);
}
