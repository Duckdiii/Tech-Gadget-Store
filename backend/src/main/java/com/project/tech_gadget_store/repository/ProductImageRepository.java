package com.project.tech_gadget_store.repository;

import com.project.tech_gadget_store.entity.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProductImageRepository extends JpaRepository<ProductImage, String> {

    @Query("SELECT pi FROM Product p JOIN p.images pi WHERE pi.id = :id AND p.id = :productId")
    Optional<ProductImage> findByIdAndProductId(@Param("id") String id, @Param("productId") String productId);
}
