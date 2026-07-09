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
            @Param("productId") String productId
    );

    @Query(value = "SELECT p.* FROM products p " +
           "JOIN product_variants pv ON pv.product_id = p.id " +
           "JOIN order_items oi ON oi.product_variant_id = pv.id " +
           "WHERE p.id <> :productId AND p.is_active = true " +
           "  AND oi.order_id IN (" +
           "      SELECT DISTINCT oi2.order_id FROM order_items oi2 " +
           "      JOIN product_variants pv2 ON oi2.product_variant_id = pv2.id " +
           "      JOIN orders o ON oi2.order_id = o.id " +
           "      WHERE pv2.product_id = :productId " +
           "        AND o.status <> 'CANCELLED'" +
           "  ) " +
           "GROUP BY p.id " +
           "ORDER BY COUNT(oi.id) DESC " +
           "LIMIT :limit", nativeQuery = true)
    List<Product> findFrequentlyBoughtTogether(
            @Param("productId") String productId,
            @Param("limit") int limit
    );

    @Query(value = "SELECT p.* FROM products p " +
           "JOIN product_variants pv ON pv.product_id = p.id " +
           "JOIN order_items oi ON oi.product_variant_id = pv.id " +
           "WHERE p.id NOT IN :productIds AND p.is_active = true " +
           "  AND oi.order_id IN (" +
           "      SELECT DISTINCT oi2.order_id FROM order_items oi2 " +
           "      JOIN product_variants pv2 ON oi2.product_variant_id = pv2.id " +
           "      JOIN orders o ON oi2.order_id = o.id " +
           "      WHERE pv2.product_id IN :productIds " +
           "        AND o.status <> 'CANCELLED'" +
           "  ) " +
           "GROUP BY p.id " +
           "ORDER BY COUNT(oi.id) DESC " +
           "LIMIT :limit", nativeQuery = true)
    List<Product> findFrequentlyBoughtTogetherForMultipleProducts(
            @Param("productIds") List<String> productIds,
            @Param("limit") int limit
    );
}
