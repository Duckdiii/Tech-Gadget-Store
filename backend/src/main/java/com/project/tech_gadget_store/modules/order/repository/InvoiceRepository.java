package com.project.tech_gadget_store.modules.order.repository;

import com.project.tech_gadget_store.modules.order.entity.Invoice;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;


public interface InvoiceRepository extends JpaRepository<Invoice, String> {
    Optional<Invoice> findByOrderId(String orderId);
}
