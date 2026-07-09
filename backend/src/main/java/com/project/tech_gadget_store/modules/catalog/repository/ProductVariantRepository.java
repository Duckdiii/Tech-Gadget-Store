package com.project.tech_gadget_store.modules.catalog.repository;

import com.project.tech_gadget_store.modules.catalog.entity.ProductVariant;
import com.project.tech_gadget_store.modules.order.entity.Order;
import com.project.tech_gadget_store.modules.order.entity.OrderItem;
import com.project.tech_gadget_store.modules.order.entity.enums.OrderStatus;
import com.project.tech_gadget_store.modules.warehouse.entity.ExportLogItem;
import com.project.tech_gadget_store.modules.warehouse.entity.ImportLogItem;
import com.project.tech_gadget_store.modules.warehouse.entity.SupplyOrderItem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;



public interface ProductVariantRepository extends JpaRepository<ProductVariant, String> {

        List<ProductVariant> findByProductId(String productId);

        Optional<ProductVariant> findByIdAndProductId(String id, String productId);

        boolean existsByProductIdAndRamGbAndStorageGbAndColorIgnoreCase(
                        String productId, Integer ramGb, Integer storageGb, String color);

        boolean existsByProductIdAndRamGbAndStorageGbAndColorIgnoreCaseAndIdNot(
                        String productId, Integer ramGb, Integer storageGb, String color, String id);

        @Query("SELECT CASE WHEN COUNT(oi) > 0 THEN true ELSE false END FROM OrderItem oi WHERE oi.productVariant.id = :variantId")
        boolean existsInOrderItems(@Param("variantId") String variantId);

        @Query("SELECT CASE WHEN COUNT(eli) > 0 THEN true ELSE false END FROM ExportLogItem eli WHERE eli.productVariant.id = :variantId")
        boolean existsInExportLogItems(@Param("variantId") String variantId);

        @Query("SELECT CASE WHEN COUNT(ili) > 0 THEN true ELSE false END FROM ImportLogItem ili WHERE ili.productVariant.id = :variantId")
        boolean existsInImportLogItems(@Param("variantId") String variantId);

        @Query("SELECT CASE WHEN COUNT(soi) > 0 THEN true ELSE false END FROM SupplyOrderItem soi WHERE soi.product.id = :variantId")
        boolean existsInSupplyOrderItems(@Param("variantId") String variantId);

        @Query("SELECT pv FROM ProductVariant pv " +
                        "WHERE pv.product.id = :productId " +
                        "  AND (pv.ramGb = :ramGb OR (pv.ramGb IS NULL AND :ramGb IS NULL)) " +
                        "  AND (pv.storageGb = :storageGb OR (pv.storageGb IS NULL AND :storageGb IS NULL)) " +
                        "  AND (pv.color = :color OR (pv.color IS NULL AND :color IS NULL)) " +
                        "  AND pv.id NOT IN (SELECT eli.productVariant.id FROM ExportLogItem eli) " +
                        "  AND pv.id NOT IN (SELECT oi.productVariant.id FROM Order o JOIN o.items oi WHERE o.orderStatus <> com.project.tech_gadget_store.modules.order.entity.enums.OrderStatus.CANCELLED)")
        List<ProductVariant> findAvailablePhysicalUnits(
                        @Param("productId") String productId, @Param("ramGb") Integer ramGb,
                        @Param("storageGb") Integer storageGb, @Param("color") String color);

        @Query("SELECT COUNT(pv) FROM ProductVariant pv " +
                        "WHERE pv.product.id = :productId " +
                        "  AND pv.id NOT IN (SELECT eli.productVariant.id FROM ExportLogItem eli) " +
                        "  AND pv.id NOT IN (SELECT oi.productVariant.id FROM Order o JOIN o.items oi WHERE o.orderStatus <> com.project.tech_gadget_store.modules.order.entity.enums.OrderStatus.CANCELLED)")
        long countAvailablePhysicalUnitsByProductId(
                        @Param("productId") String productId);
}
