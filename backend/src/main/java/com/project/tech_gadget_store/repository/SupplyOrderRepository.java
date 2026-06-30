package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.SupplyOrder;
import com.project.tech_gadget_store.entity.enums.POStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupplyOrderRepository extends JpaRepository<SupplyOrder, String> {

    List<SupplyOrder> findAllBySupplierId(String supplierId);

    List<SupplyOrder> findAllByStatus(POStatus status);
}
