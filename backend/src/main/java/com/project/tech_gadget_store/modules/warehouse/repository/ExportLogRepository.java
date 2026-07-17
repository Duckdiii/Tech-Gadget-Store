package com.project.tech_gadget_store.modules.warehouse.repository;

import com.project.tech_gadget_store.modules.warehouse.entity.ExportLog;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;



@Repository
public interface ExportLogRepository extends JpaRepository<ExportLog, String> {

    List<ExportLog> findByExportedAtBetween(LocalDateTime start, LocalDateTime end);

    Page<ExportLog> findAllByOrderByExportedAtDesc(Pageable pageable);

    // cursorTimestamp must be cast to timestamp — see SupplyOrderRepository.findSupplyOrdersCursor
    // for why: Postgres can't infer the type of a bare null parameter under "IS NULL".
    @Query("SELECT el FROM ExportLog el WHERE " +
           "(cast(:cursorTimestamp as timestamp) IS NULL OR el.exportedAt < :cursorTimestamp OR " +
           "(el.exportedAt = :cursorTimestamp AND el.id < :cursorId)) " +
           "ORDER BY el.exportedAt DESC, el.id DESC")
    List<ExportLog> findExportLogsCursor(
            @Param("cursorTimestamp") LocalDateTime cursorTimestamp,
            @Param("cursorId") String cursorId,
            Pageable pageable);
}
