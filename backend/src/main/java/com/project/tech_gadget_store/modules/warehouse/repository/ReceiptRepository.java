package com.project.tech_gadget_store.modules.warehouse.repository;

import com.project.tech_gadget_store.modules.warehouse.entity.Receipt;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;



@Repository
public interface ReceiptRepository extends JpaRepository<Receipt, String> {
    Optional<Receipt> findByExportLogId(String exportLogId);
}
