package com.project.tech_gadget_store.modules.review.service;

import com.project.tech_gadget_store.common.exception.ForbiddenException;
import com.project.tech_gadget_store.common.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.modules.auth.entity.User;
import com.project.tech_gadget_store.modules.auth.repository.UserRepository;
import com.project.tech_gadget_store.modules.catalog.entity.Product;
import com.project.tech_gadget_store.modules.catalog.repository.ProductRepository;
import com.project.tech_gadget_store.modules.review.dto.request.ReviewRequestDto;
import com.project.tech_gadget_store.modules.review.dto.response.ReviewHighlightResponseDto;
import com.project.tech_gadget_store.modules.review.dto.response.ReviewResponseDto;
import com.project.tech_gadget_store.modules.review.entity.Review;
import com.project.tech_gadget_store.modules.review.repository.ReviewRepository;
import com.project.tech_gadget_store.modules.settings.service.StoreSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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
    private final StoreSettingsService storeSettingsService;

    @Transactional
    public ReviewResponseDto createReview(ReviewRequestDto requestDto, String authorUserId) {
        if (!storeSettingsService.isProductReviewsAllowed()) {
            throw new ForbiddenException("Tính năng đánh giá sản phẩm hiện đang tạm khoá.");
        }

        Product product = productRepository.findById(requestDto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + requestDto.getProductId()));

        User user = userRepository.findById(authorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + authorUserId));

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
        return mapToDto(savedReview, authorUserId);
    }

    public Page<ReviewResponseDto> getProductReviews(String productId, Pageable pageable, String viewerUserId) {
        Page<Review> topLevelReviews = reviewRepository.findByProductIdAndParentIsNull(productId, pageable);
        return topLevelReviews.map(review -> mapToDto(review, viewerUserId));
    }

    /** Most recent well-rated reviews (4-5 stars) across all products — used for homepage testimonials. */
    public List<ReviewHighlightResponseDto> getHighlightReviews(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return reviewRepository.findByParentIsNullAndRatingGreaterThanEqualOrderByCreatedAtDesc(4, pageable)
                .stream()
                .map(this::mapToHighlightDto)
                .collect(Collectors.toList());
    }

    private ReviewHighlightResponseDto mapToHighlightDto(Review review) {
        return ReviewHighlightResponseDto.builder()
                .id(review.getId())
                .userName(review.getUser() != null ? review.getUser().getFullName() : "Khách hàng")
                .productName(review.getProduct() != null ? review.getProduct().getName() : null)
                .content(review.getContent())
                .rating(review.getRating())
                .createdAt(review.getCreatedAt())
                .build();
    }

    @Transactional
    public void deleteReview(String id, String requesterUserId) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + id));
        if (review.getUser() == null || !review.getUser().getId().equals(requesterUserId)) {
            throw new ForbiddenException("Bạn không có quyền xoá đánh giá này.");
        }
        reviewRepository.delete(review);
    }

    private ReviewResponseDto mapToDto(Review review, String viewerUserId) {
        String parentId = (review.getParent() != null) ? review.getParent().getId() : null;
        String userName = (review.getUser() != null) ? review.getUser().getFullName() : "Unknown User";
        boolean mine = viewerUserId != null && review.getUser() != null
                && viewerUserId.equals(review.getUser().getId());

        List<ReviewResponseDto> repliesDto = new ArrayList<>();
        if (review.getReplies() != null) {
            repliesDto = review.getReplies().stream()
                    .map(reply -> mapToDto(reply, viewerUserId))
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
                .mine(mine)
                .build();
    }
}
