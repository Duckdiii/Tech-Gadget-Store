package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.FavoriteProduct;
import com.project.tech_gadget_store.entity.enums.SubscriptionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface FavoriteProductRepository extends JpaRepository<FavoriteProduct, String> {

    @Query("SELECT f FROM FavoriteProduct f WHERE f.customer.id = :customerId AND f.status = :status")
    Page<FavoriteProduct> findByCustomerIdAndStatus(String customerId, SubscriptionStatus status, Pageable pageable);

    @Query("SELECT f FROM FavoriteProduct f WHERE f.customer.id = :customerId AND f.productVariant.id = :productVariantId")
    Optional<FavoriteProduct> findByCustomerIdAndProductVariantId(String customerId, String productVariantId);

    boolean existsByCustomerIdAndProductVariantIdAndStatus(String customerId, String productVariantId, SubscriptionStatus status);

    List<FavoriteProduct> findByProductVariantIdAndStatus(String productVariantId, SubscriptionStatus status);

    @Query("SELECT f FROM FavoriteProduct f WHERE f.productVariant.product.id = :productId AND f.status = :status")
    List<FavoriteProduct> findByProductVariantProductIdAndStatus(String productId, SubscriptionStatus status);
}
