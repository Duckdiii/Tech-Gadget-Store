package com.project.tech_gadget_store.service.impl;

import com.project.tech_gadget_store.dto.response.ReviewResponse;
import com.project.tech_gadget_store.entity.Review;
import com.project.tech_gadget_store.repository.ReviewRepository;
import com.project.tech_gadget_store.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {
    private final ReviewRepository reviewRepository;

    @Override
    public Flux<ReviewResponse> getReviewsByProductId(UUID productId) {
        Review.validateProductId(productId);
        return reviewRepository.findAllByProductId(productId)
                .map(ReviewResponse::fromEntity);
    }

    @Override
    public Flux<ReviewResponse> getReviewsByCustomerId(UUID customerId) {
        Review.validateCustomerId(customerId);
        return reviewRepository.findAllByCustomerId(customerId)
                .map(ReviewResponse::fromEntity);
    }

    @Override
    public Flux<ReviewResponse> getAllReviews() {
        return reviewRepository.findAll()
                .map(ReviewResponse::fromEntity);
    }

    @Override
    public Mono<ReviewResponse> createReview(Review review) {
        return reviewRepository.save(review.prepareForCreate())
                .map(ReviewResponse::fromEntity);
    }
}
