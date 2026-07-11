package com.project.tech_gadget_store.modules.catalog.repository;

import com.project.tech_gadget_store.modules.catalog.entity.Product;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, String>, JpaSpecificationExecutor<Product> {

        @Query("SELECT DISTINCT p FROM Product p JOIN p.promotions promo WHERE promo.active = true AND promo.startAt <= :now AND promo.endAt >= :now AND p.isActive = true")
        List<Product> findTodayFlashSaleProducts(LocalDateTime now);

        boolean existsByNameIgnoreCase(String name);

        Optional<Product> findByNameIgnoreCase(String name);

        boolean existsByNameIgnoreCaseAndIdNot(String name, String id);

        Optional<Product> findByIdAndIsActiveTrue(String id);

        boolean existsByBrandId(String brandId);

        boolean existsByCategoryId(String categoryId);

        @Query("SELECT DISTINCT p FROM Product p JOIN FETCH p.category JOIN FETCH p.brand " +
                        "WHERE p.category.id = :categoryId AND p.id <> :productId AND p.isActive = true")
        List<Product> findCandidatesForRecommendation(
                        @Param("categoryId") String categoryId,
                        @Param("productId") String productId);

        /**
         * IDs of frequently-bought-together products. Returns ids rather than {@code Product}
         * directly — a native query auto-mapped to the JOINED-inheritance {@code Product} root
         * requires a synthetic discriminator column that plain {@code SELECT p.*} cannot supply,
         * so callers must re-fetch entities via {@code findAllById}.
         */
        @Query(value = "SELECT p.id FROM products p " +
                        "JOIN product_variants pv ON pv.product_id = p.id " +
                        "JOIN order_items oi ON oi.product_variant_id = pv.id " +
                        "WHERE p.id <> :productId AND p.is_active = true " +
                        "  AND oi.order_id IN (" +
                        "      SELECT DISTINCT oi2.order_id FROM order_items oi2 " +
                        "      JOIN product_variants pv2 ON oi2.product_variant_id = pv2.id " +
                        "      JOIN orders o ON oi2.order_id = o.id " +
                        "      WHERE pv2.product_id = :productId " +
                        "        AND o.order_status <> 'CANCELLED'" +
                        "  ) " +
                        "GROUP BY p.id " +
                        "ORDER BY COUNT(oi.id) DESC " +
                        "LIMIT :limit", nativeQuery = true)
        List<String> findFrequentlyBoughtTogetherIds(
                        @Param("productId") String productId,
                        @Param("limit") int limit);

        /** See {@link #findFrequentlyBoughtTogetherIds} for why this returns ids. */
        @Query(value = "SELECT p.id FROM products p " +
                        "JOIN product_variants pv ON pv.product_id = p.id " +
                        "JOIN order_items oi ON oi.product_variant_id = pv.id " +
                        "WHERE p.id NOT IN :productIds AND p.is_active = true " +
                        "  AND oi.order_id IN (" +
                        "      SELECT DISTINCT oi2.order_id FROM order_items oi2 " +
                        "      JOIN product_variants pv2 ON oi2.product_variant_id = pv2.id " +
                        "      JOIN orders o ON oi2.order_id = o.id " +
                        "      WHERE pv2.product_id IN :productIds " +
                        "        AND o.order_status <> 'CANCELLED'" +
                        "  ) " +
                        "GROUP BY p.id " +
                        "ORDER BY COUNT(oi.id) DESC " +
                        "LIMIT :limit", nativeQuery = true)
        List<String> findFrequentlyBoughtTogetherIdsForMultipleProducts(
                        @Param("productIds") List<String> productIds,
                        @Param("limit") int limit);

        /**
         * IDs of top-selling products within a set of categories, excluding some products
         * (typically ones the customer already bought). Returns ids rather than {@code Product}
         * directly — a native query auto-mapped to the JOINED-inheritance {@code Product} root
         * requires a synthetic discriminator column that plain {@code SELECT p.*} cannot supply,
         * so callers must re-fetch entities via {@code findAllById}. Caller must also pass a
         * non-empty {@code excludeProductIds} (e.g. a placeholder id) since an empty NOT IN list
         * is invalid SQL.
         */
        @Query(value = "SELECT p.id FROM products p " +
                        "JOIN product_variants pv ON pv.product_id = p.id " +
                        "JOIN order_items oi ON oi.product_variant_id = pv.id " +
                        "JOIN orders o ON oi.order_id = o.id " +
                        "WHERE p.category_id IN (:categoryIds) AND p.id NOT IN (:excludeProductIds) " +
                        "  AND p.is_active = true AND o.order_status <> 'CANCELLED' " +
                        "GROUP BY p.id " +
                        "ORDER BY COUNT(oi.id) DESC " +
                        "LIMIT :limit", nativeQuery = true)
        List<String> findTopSellingIdsByCategoriesExcluding(
                        @Param("categoryIds") List<String> categoryIds,
                        @Param("excludeProductIds") List<String> excludeProductIds,
                        @Param("limit") int limit);

        /**
         * IDs of site-wide top sellers, excluding some products. Used as the cold-start
         * fallback when a customer has no purchase history to personalize from. See
         * {@link #findTopSellingIdsByCategoriesExcluding} for why this returns ids and the
         * same non-empty {@code excludeProductIds} requirement.
         */
        @Query(value = "SELECT p.id FROM products p " +
                        "JOIN product_variants pv ON pv.product_id = p.id " +
                        "JOIN order_items oi ON oi.product_variant_id = pv.id " +
                        "JOIN orders o ON oi.order_id = o.id " +
                        "WHERE p.id NOT IN (:excludeProductIds) " +
                        "  AND p.is_active = true AND o.order_status <> 'CANCELLED' " +
                        "GROUP BY p.id " +
                        "ORDER BY COUNT(oi.id) DESC " +
                        "LIMIT :limit", nativeQuery = true)
        List<String> findTopSellingIdsOverall(
                        @Param("excludeProductIds") List<String> excludeProductIds,
                        @Param("limit") int limit);
}
