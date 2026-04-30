package com.project.tech_gadget_store.dto.response;

import com.project.tech_gadget_store.entity.Review;

public record ReviewResponse(
        String comment,
        Integer rating,
        String createdAt) {
    public static ReviewResponse fromEntity(Review review) {
        return new ReviewResponse(
                review.getComment(),
                review.getRating(),
                review.getCreatedAt().toString());
    }

}
