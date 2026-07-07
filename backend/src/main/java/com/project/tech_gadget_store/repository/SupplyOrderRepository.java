package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.SupplyOrder;
import com.project.tech_gadget_store.entity.enums.POStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SupplyOrderRepository extends JpaRepository<SupplyOrder, String> {

    List<SupplyOrder> findAllBySupplierId(String supplierId);

    List<SupplyOrder> findAllByStatus(POStatus status);

    boolean existsBySupplierIdAndStatusIn(String supplierId, List<POStatus> statuses);

    @Query("SELECT DISTINCT so.supplier.id FROM SupplyOrder so WHERE so.status IN :statuses")
    List<String> findDistinctSupplierIdsByStatusIn(@Param("statuses") List<POStatus> statuses);
}
