package com.project.tech_gadget_store.modules.warehouse.repository;

import com.project.tech_gadget_store.common.entity.enums.POStatus;
import com.project.tech_gadget_store.modules.warehouse.entity.SupplyOrder;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;



public interface SupplyOrderRepository extends JpaRepository<SupplyOrder, String> {

    List<SupplyOrder> findAllBySupplierId(String supplierId);

    List<SupplyOrder> findAllByStatus(POStatus status);

    boolean existsBySupplierIdAndStatusIn(String supplierId, List<POStatus> statuses);

    @Query("SELECT DISTINCT so.supplier.id FROM SupplyOrder so WHERE so.status IN :statuses")
    List<String> findDistinctSupplierIdsByStatusIn(@Param("statuses") List<POStatus> statuses);

    // cursorTimestamp must be cast to timestamp — a bare ":cursorTimestamp IS NULL" leaves
    // Postgres unable to infer the parameter's type on the first page (cursorTimestamp == null),
    // failing with "could not determine data type of parameter $1" (same fix already applied to
    // OrderRepository.findOrdersCursor, PaymentLogRepository, CustomerRepository).
    @Query("SELECT so FROM SupplyOrder so WHERE " +
           "(cast(:cursorTimestamp as timestamp) IS NULL OR so.createdAt < :cursorTimestamp OR " +
           "(so.createdAt = :cursorTimestamp AND so.id < :cursorId)) " +
           "ORDER BY so.createdAt DESC, so.id DESC")
    List<SupplyOrder> findSupplyOrdersCursor(
            @Param("cursorTimestamp") LocalDateTime cursorTimestamp,
            @Param("cursorId") String cursorId,
            Pageable pageable);
}
