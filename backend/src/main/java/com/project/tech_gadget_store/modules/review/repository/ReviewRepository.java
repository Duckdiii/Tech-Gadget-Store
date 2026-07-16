package com.project.tech_gadget_store.modules.review.repository;

import com.project.tech_gadget_store.modules.review.entity.Review;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, String> {
    Page<Review> findByProductIdAndParentIsNull(String productId, Pageable pageable);

    List<Review> findByParentIsNullAndRatingGreaterThanEqualOrderByCreatedAtDesc(Integer rating, Pageable pageable);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.rating IS NOT NULL")
    Double findAverageRating();

    /** [productId, averageRating, reviewCount] per product — batched to avoid N+1 when rendering product lists. */
    @Query("SELECT r.product.id, AVG(r.rating), COUNT(r) FROM Review r " +
            "WHERE r.product.id IN :productIds AND r.rating IS NOT NULL GROUP BY r.product.id")
    List<Object[]> findRatingStatsByProductIds(@Param("productIds") List<String> productIds);
}
