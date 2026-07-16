package com.project.tech_gadget_store.modules.review.controller;

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
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<ReviewResponseDto> createReview(@Valid @RequestBody ReviewRequestDto requestDto) {
        ReviewResponseDto created = reviewService.createReview(requestDto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<Page<ReviewResponseDto>> getProductReviews(
            @PathVariable String productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ReviewResponseDto> reviews = reviewService.getProductReviews(productId, PageRequest.of(page, size));
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/highlights")
    public ResponseEntity<List<ReviewHighlightResponseDto>> getHighlightReviews(
            @RequestParam(defaultValue = "6") int limit) {
        return ResponseEntity.ok(reviewService.getHighlightReviews(limit));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable String id) {
        reviewService.deleteReview(id);
        return ResponseEntity.noContent().build();
    }
}
