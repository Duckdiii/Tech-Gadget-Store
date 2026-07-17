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

        @Query("SELECT COUNT(ps) FROM ProductSerial ps " +
                        "WHERE ps.productVariant.id = :variantId " +
                        "  AND ps.status = com.project.tech_gadget_store.modules.catalog.entity.enums.SerialStatus.IN_STOCK")
        long countAvailablePhysicalUnitsByVariantId(@Param("variantId") String variantId);

        default long countAvailablePhysicalUnits(
                        String productId, Integer ramGb,
                        Integer storageGb, String color) {
                List<ProductVariant> allVariants = findByProductId(productId);
                ProductVariant matched = allVariants.stream()
                                .filter(v -> java.util.Objects.equals(v.getRamGb(), ramGb)
                                                && java.util.Objects.equals(v.getStorageGb(), storageGb)
                                                && (color == null ? v.getColor() == null : color.equalsIgnoreCase(v.getColor())))
                                .findFirst()
                                .orElse(null);
                if (matched == null) {
                        return 0L;
                }
                return countAvailablePhysicalUnitsByVariantId(matched.getId());
        }

        /** @deprecated Dùng {@link #countAvailablePhysicalUnits} để đếm số serial thực tế.
         *  Query này chỉ trả về tối đa 1 ProductVariant dù có nhiều serial IN_STOCK. */
        @Deprecated
        @Query("SELECT pv FROM ProductSerial ps JOIN ps.productVariant pv " +
                        "WHERE pv.id = :variantId " +
                        "  AND ps.status = com.project.tech_gadget_store.modules.catalog.entity.enums.SerialStatus.IN_STOCK")
        List<ProductVariant> findAvailablePhysicalUnitsByVariantId(@Param("variantId") String variantId);

        /** @deprecated Dùng {@link #countAvailablePhysicalUnits} để đếm số serial thực tế. */
        @Deprecated
        default List<ProductVariant> findAvailablePhysicalUnits(
                        String productId, Integer ramGb,
                        Integer storageGb, String color) {
                List<ProductVariant> allVariants = findByProductId(productId);
                ProductVariant matched = allVariants.stream()
                                .filter(v -> java.util.Objects.equals(v.getRamGb(), ramGb)
                                                && java.util.Objects.equals(v.getStorageGb(), storageGb)
                                                && (color == null ? v.getColor() == null : color.equalsIgnoreCase(v.getColor())))
                                .findFirst()
                                .orElse(null);
                if (matched == null) {
                        return java.util.Collections.emptyList();
                }
                return findAvailablePhysicalUnitsByVariantId(matched.getId());
        }

        @Query("SELECT COUNT(ps) FROM ProductSerial ps " +
                        "WHERE ps.productVariant.product.id = :productId " +
                        "  AND ps.status = com.project.tech_gadget_store.modules.catalog.entity.enums.SerialStatus.IN_STOCK")
        long countAvailablePhysicalUnitsByProductId(
                        @Param("productId") String productId);

        @Query("SELECT pv FROM ProductVariant pv WHERE pv.product.id IN :productIds")
        List<ProductVariant> findVariantsForProductIds(@Param("productIds") List<String> productIds);

        @Query("SELECT pv.product.id, COALESCE(SUM(CASE WHEN ps.status = com.project.tech_gadget_store.modules.catalog.entity.enums.SerialStatus.IN_STOCK THEN 1L ELSE 0L END), 0L) " +
                        "FROM ProductVariant pv LEFT JOIN ProductSerial ps ON ps.productVariant = pv " +
                        "GROUP BY pv.product.id " +
                        "HAVING COALESCE(SUM(CASE WHEN ps.status = com.project.tech_gadget_store.modules.catalog.entity.enums.SerialStatus.IN_STOCK THEN 1L ELSE 0L END), 0L) <= :threshold " +
                        "ORDER BY 2 ASC")
        List<Object[]> findLowStockProductIdsAndCounts(@Param("threshold") long threshold);

        /**
         * Batch-count IN_STOCK serials grouped by productId in ONE single query.
         * Trả về [[productId, count], ...] — dùng để tránh N+1 khi load danh sách sản phẩm.
         */
        @Query("SELECT pv.product.id, COALESCE(SUM(CASE WHEN ps.status = " +
                        "com.project.tech_gadget_store.modules.catalog.entity.enums.SerialStatus.IN_STOCK THEN 1L ELSE 0L END), 0L) " +
                        "FROM ProductVariant pv LEFT JOIN ProductSerial ps ON ps.productVariant = pv " +
                        "WHERE pv.product.id IN :productIds " +
                        "GROUP BY pv.product.id")
        List<Object[]> countAvailablePhysicalUnitsByProductIds(@Param("productIds") List<String> productIds);
}
