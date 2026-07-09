package com.project.tech_gadget_store.modules.review.service;

import com.project.tech_gadget_store.common.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.modules.auth.entity.User;
import com.project.tech_gadget_store.modules.auth.repository.UserRepository;
import com.project.tech_gadget_store.modules.catalog.entity.Product;
import com.project.tech_gadget_store.modules.catalog.repository.ProductRepository;
import com.project.tech_gadget_store.modules.review.dto.request.ReviewRequestDto;
import com.project.tech_gadget_store.modules.review.dto.response.ReviewResponseDto;
import com.project.tech_gadget_store.modules.review.entity.Review;
import com.project.tech_gadget_store.modules.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReviewResponseDto createReview(ReviewRequestDto requestDto) {
        Product product = productRepository.findById(requestDto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + requestDto.getProductId()));

        User user = userRepository.findById(requestDto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + requestDto.getUserId()));

        Review parent = null;
        if (requestDto.getParentId() != null && !requestDto.getParentId().isBlank()) {
            parent = reviewRepository.findById(requestDto.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent review not found with id: " + requestDto.getParentId()));
        }

        Review review = Review.builder()
                .product(product)
                .user(user)
                .content(requestDto.getContent())
                .rating(requestDto.getRating())
                .parent(parent)
                .build();

        Review savedReview = reviewRepository.save(review);
        return mapToDto(savedReview);
    }

    public Page<ReviewResponseDto> getProductReviews(String productId, Pageable pageable) {
        Page<Review> topLevelReviews = reviewRepository.findByProductIdAndParentIsNull(productId, pageable);
        return topLevelReviews.map(this::mapToDto);
    }

    @Transactional
    public void deleteReview(String id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + id));
        reviewRepository.delete(review);
    }

    private ReviewResponseDto mapToDto(Review review) {
        String parentId = (review.getParent() != null) ? review.getParent().getId() : null;
        String userName = (review.getUser() != null) ? review.getUser().getFullName() : "Unknown User";

        List<ReviewResponseDto> repliesDto = new ArrayList<>();
        if (review.getReplies() != null) {
            repliesDto = review.getReplies().stream()
                    .map(this::mapToDto)
                    .collect(Collectors.toList());
        }

        return ReviewResponseDto.builder()
                .id(review.getId())
                .productId(review.getProduct().getId())
                .userId(review.getUser().getId())
                .userName(userName)
                .content(review.getContent())
                .rating(review.getRating())
                .parentId(parentId)
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .replies(repliesDto)
                .build();
    }
}
