package com.project.tech_gadget_store.modules.review.repository;

import com.project.tech_gadget_store.modules.review.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, String> {
    Page<Review> findByProductIdAndParentIsNull(String productId, Pageable pageable);
}
