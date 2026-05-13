package com.project.tech_gadget_store.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.util.StringUtils;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("reviews")
public class Review {
    @Id
    private UUID id;
    @Column("product_id")
    private UUID productId;
    @Column("customer_id")
    private UUID customerId;
    private Integer rating;
    private String comment;
    @Column("created_at")
    private OffsetDateTime createdAt;

    public static void validateProductId(UUID productId) {
        if (productId == null) {
            throw new IllegalArgumentException("Product ID cannot be null");
        }
    }

    public static void validateCustomerId(UUID customerId) {
        if (customerId == null) {
            throw new IllegalArgumentException("Customer ID cannot be null");
        }
    }

    public static void validateForCreate(Review review) {
        if (review == null) {
            throw new IllegalArgumentException("Review cannot be null");
        }
        validateProductId(review.getProductId());
        validateCustomerId(review.getCustomerId());
        validateRating(review.getRating());
    }

    public static void validateRating(Integer rating) {
        if (rating == null || rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
    }

    public static String normalizeComment(String comment) {
        return StringUtils.hasText(comment) ? comment.trim() : comment;
    }

    public Review prepareForCreate() {
        validateForCreate(this);
        this.id = this.id == null ? UUID.randomUUID() : this.id;
        this.comment = normalizeComment(this.comment);
        this.createdAt = this.createdAt == null ? OffsetDateTime.now() : this.createdAt;
        return this;
    }
}
