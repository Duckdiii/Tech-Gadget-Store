package com.project.tech_gadget_store.modules.catalog.repository;

import com.project.tech_gadget_store.modules.catalog.entity.Product;
import com.project.tech_gadget_store.modules.catalog.entity.ProductImage;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;



public interface ProductImageRepository extends JpaRepository<ProductImage, String> {

    @Query("SELECT pi FROM Product p JOIN p.images pi WHERE pi.id = :id AND p.id = :productId")
    Optional<ProductImage> findByIdAndProductId(@Param("id") String id, @Param("productId") String productId);
}
