package com.project.tech_gadget_store.modules.catalog.controller;

import com.project.tech_gadget_store.modules.catalog.dto.response.ProductResponseDto;
import com.project.tech_gadget_store.modules.catalog.service.RecommendationService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping("/{productId}/similar")
    public ResponseEntity<List<ProductResponseDto>> getSimilarProducts(@PathVariable String productId) {
        List<ProductResponseDto> similarProducts = recommendationService.getSimilarProducts(productId);
        return ResponseEntity.ok(similarProducts);
    }
}
