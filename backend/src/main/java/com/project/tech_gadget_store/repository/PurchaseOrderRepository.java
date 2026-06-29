package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.PurchaseOrder;
import com.project.tech_gadget_store.entity.enums.PurchaseOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, String> {

    List<PurchaseOrder> findAllBySupplierId(String supplierId);

    List<PurchaseOrder> findAllByStatus(PurchaseOrderStatus status);
}
