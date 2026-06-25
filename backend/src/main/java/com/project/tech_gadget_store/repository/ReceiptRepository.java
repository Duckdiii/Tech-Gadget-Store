package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.Receipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReceiptRepository extends JpaRepository<Receipt, String> {
    Optional<Receipt> findByExportLogId(String exportLogId);
}
