package com.project.tech_gadget_store.modules.catalog.repository;

import com.project.tech_gadget_store.modules.catalog.entity.FavoriteProduct;
import com.project.tech_gadget_store.modules.loyalty.entity.enums.SubscriptionStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;



public interface FavoriteProductRepository extends JpaRepository<FavoriteProduct, String> {

    @Query("SELECT f FROM FavoriteProduct f WHERE f.customer.id = :customerId AND f.status = :status")
    Page<FavoriteProduct> findByCustomerIdAndStatus(String customerId, SubscriptionStatus status, Pageable pageable);

    @Query("SELECT f FROM FavoriteProduct f WHERE f.customer.id = :customerId AND f.isFavorite = true")
    Page<FavoriteProduct> findByCustomerIdAndIsFavoriteTrue(String customerId, Pageable pageable);

    @Query("SELECT f FROM FavoriteProduct f WHERE f.customer.id = :customerId AND f.productVariant.id = :productVariantId")
    Optional<FavoriteProduct> findByCustomerIdAndProductVariantId(String customerId, String productVariantId);

    boolean existsByCustomerIdAndProductVariantIdAndStatus(String customerId, String productVariantId, SubscriptionStatus status);

    boolean existsByCustomerIdAndProductVariantIdAndIsFavoriteTrue(String customerId, String productVariantId);

    List<FavoriteProduct> findByProductVariantIdAndStatus(String productVariantId, SubscriptionStatus status);

    @Query("SELECT f FROM FavoriteProduct f WHERE f.productVariant.product.id = :productId AND f.status = :status")
    List<FavoriteProduct> findByProductVariantProductIdAndStatus(String productId, SubscriptionStatus status);
}
