package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, String> {

        List<ProductVariant> findByProductId(String productId);

        boolean existsByProductIdAndRamGbAndStorageGbAndColorIgnoreCase(
                        String productId, Integer ramGb, Integer storageGb, String color);

        @Query("SELECT pv FROM ProductVariant pv " +
                        "WHERE pv.product.id = :productId " +
                        "  AND (pv.ramGb = :ramGb OR (pv.ramGb IS NULL AND :ramGb IS NULL)) " +
                        "  AND (pv.storageGb = :storageGb OR (pv.storageGb IS NULL AND :storageGb IS NULL)) " +
                        "  AND (pv.color = :color OR (pv.color IS NULL AND :color IS NULL)) " +
                        "  AND pv.id NOT IN (SELECT eli.productVariant.id FROM ExportLogItem eli) " +
                        "  AND pv.id NOT IN (SELECT oi.productVariant.id FROM OrderItem oi)")
        List<ProductVariant> findAvailablePhysicalUnits(
                        @Param("productId") String productId, @Param("ramGb") Integer ramGb,
                        @Param("storageGb") Integer storageGb, @Param("color") String color);

        @Query("SELECT COUNT(pv) FROM ProductVariant pv " +
                        "WHERE pv.product.id = :productId " +
                        "  AND pv.id NOT IN (SELECT eli.productVariant.id FROM ExportLogItem eli) " +
                        "  AND pv.id NOT IN (SELECT oi.productVariant.id FROM OrderItem oi)")
        long countAvailablePhysicalUnitsByProductId(
                        @Param("productId") String productId);
}
