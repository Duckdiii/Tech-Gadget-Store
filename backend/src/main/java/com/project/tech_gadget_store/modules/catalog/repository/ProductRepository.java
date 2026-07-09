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
}
