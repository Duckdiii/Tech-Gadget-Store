package com.project.tech_gadget_store.modules.review.controller;

import com.project.tech_gadget_store.common.exception.ForbiddenException;
import com.project.tech_gadget_store.modules.auth.entity.Customer;
import com.project.tech_gadget_store.modules.auth.repository.CustomerRepository;
import com.project.tech_gadget_store.modules.review.dto.request.ReviewRequestDto;
import com.project.tech_gadget_store.modules.review.dto.response.ReviewHighlightResponseDto;
import com.project.tech_gadget_store.modules.review.dto.response.ReviewResponseDto;
import com.project.tech_gadget_store.modules.review.service.ReviewService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;
    private final CustomerRepository customerRepository;

    public ReviewController(ReviewService reviewService, CustomerRepository customerRepository) {
        this.reviewService = reviewService;
        this.customerRepository = customerRepository;
    }

    @PostMapping
    public ResponseEntity<ReviewResponseDto> createReview(@Valid @RequestBody ReviewRequestDto requestDto,
            Authentication authentication) {
        String customerId = resolveCustomerId(authentication);
        ReviewResponseDto created = reviewService.createReview(requestDto, customerId);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    private String resolveCustomerId(Authentication authentication) {
        Customer customer = customerRepository.findByAccountEmail(authentication.getName())
                .orElseThrow(() -> new ForbiddenException("Chỉ khách hàng mới có thể viết đánh giá."));
        return customer.getId();
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<Page<ReviewResponseDto>> getProductReviews(
            @PathVariable String productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        String viewerId = customerRepository.findByAccountEmail(authentication.getName())
                .map(Customer::getId)
                .orElse(null);
        Page<ReviewResponseDto> reviews = reviewService.getProductReviews(productId, PageRequest.of(page, size), viewerId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/highlights")
    public ResponseEntity<List<ReviewHighlightResponseDto>> getHighlightReviews(
            @RequestParam(defaultValue = "6") int limit) {
        return ResponseEntity.ok(reviewService.getHighlightReviews(limit));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable String id, Authentication authentication) {
        String customerId = resolveCustomerId(authentication);
        reviewService.deleteReview(id, customerId);
        return ResponseEntity.noContent().build();
    }
}
