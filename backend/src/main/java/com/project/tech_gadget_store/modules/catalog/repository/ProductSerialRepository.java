package com.project.tech_gadget_store.modules.catalog.repository;

import com.project.tech_gadget_store.modules.catalog.entity.ProductSerial;
import com.project.tech_gadget_store.modules.catalog.entity.enums.SerialStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductSerialRepository extends JpaRepository<ProductSerial, String> {
    Optional<ProductSerial> findBySerialNumber(String serialNumber);
    
    long countByProductVariantIdAndStatus(String productVariantId, SerialStatus status);
    
    List<ProductSerial> findByProductVariantIdAndStatus(String productVariantId, SerialStatus status, Pageable pageable);

    @Query("SELECT COUNT(ps) FROM ProductSerial ps WHERE ps.productVariant.product.id = :productId AND ps.status = :status")
    long countByProductIdAndStatus(@Param("productId") String productId, @Param("status") SerialStatus status);

    List<ProductSerial> findByInvoiceItemId(String invoiceItemId);
}
