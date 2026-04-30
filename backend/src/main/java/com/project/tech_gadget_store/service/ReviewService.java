package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.request.ReviewRequest;
import com.project.tech_gadget_store.dto.response.ReviewResponse;
import com.project.tech_gadget_store.entity.Review;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface ReviewService {
    Flux<ReviewResponse> getReviewsByProductId(UUID productId);

    Flux<ReviewResponse> getReviewsByCustomerId(UUID customerId);

    Flux<ReviewResponse> getAllReviews();

    Mono<ReviewResponse> createReview(Review review);

}
