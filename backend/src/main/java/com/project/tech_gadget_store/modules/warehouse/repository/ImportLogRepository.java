package com.project.tech_gadget_store.modules.warehouse.repository;

import com.project.tech_gadget_store.modules.warehouse.entity.ImportLog;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;



public interface ImportLogRepository extends JpaRepository<ImportLog, String> {

    List<ImportLog> findAllByOrderByImportedAtDesc();

    List<ImportLog> findByImportedAtBetween(LocalDateTime start, LocalDateTime end);

    Page<ImportLog> findAllByOrderByImportedAtDesc(Pageable pageable);

    // cursorTimestamp must be cast to timestamp — see SupplyOrderRepository.findSupplyOrdersCursor
    // for why: Postgres can't infer the type of a bare null parameter under "IS NULL".
    @Query("SELECT il FROM ImportLog il WHERE " +
           "(cast(:cursorTimestamp as timestamp) IS NULL OR il.importedAt < :cursorTimestamp OR " +
           "(il.importedAt = :cursorTimestamp AND il.id < :cursorId)) " +
           "ORDER BY il.importedAt DESC, il.id DESC")
    List<ImportLog> findImportLogsCursor(
            @Param("cursorTimestamp") LocalDateTime cursorTimestamp,
            @Param("cursorId") String cursorId,
            Pageable pageable);
}
