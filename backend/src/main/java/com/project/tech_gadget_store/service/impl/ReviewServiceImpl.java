package com.project.tech_gadget_store.service.impl;

import com.project.tech_gadget_store.dto.response.ReviewResponse;
import com.project.tech_gadget_store.entity.Review;
import com.project.tech_gadget_store.repository.ReviewRepository;
import com.project.tech_gadget_store.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public class ReviewServiceImpl implements ReviewService {
    private final ReviewRepository reviewRepository;

    @Autowired
    public ReviewServiceImpl(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    @Override
    public Flux<ReviewResponse> getReviewsByProductId(UUID productId) {
        return reviewRepository.findAllByProductId(productId)
                .map(ReviewResponse::fromEntity);
    }

    @Override
    public Flux<ReviewResponse> getReviewsByCustomerId(UUID customerId) {
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
        return reviewRepository.save(review)
                .map(ReviewResponse::fromEntity);
    }

}
