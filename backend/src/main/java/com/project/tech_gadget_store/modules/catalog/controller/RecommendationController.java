package com.project.tech_gadget_store.modules.catalog.controller;

import com.project.tech_gadget_store.modules.catalog.dto.response.ProductResponseDto;
import com.project.tech_gadget_store.modules.catalog.service.RecommendationService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.RequestParam;

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

    @GetMapping("/{productId}/frequently-bought-together")
    public ResponseEntity<List<ProductResponseDto>> getFrequentlyBoughtTogether(@PathVariable String productId) {
        List<ProductResponseDto> recommendations = recommendationService.getFrequentlyBoughtTogether(productId);
        return ResponseEntity.ok(recommendations);
    }

    @GetMapping("/cart-recommendations")
    public ResponseEntity<List<ProductResponseDto>> getCartRecommendations(@RequestParam List<String> productIds) {
        List<ProductResponseDto> recommendations = recommendationService.getCartRecommendations(productIds);
        return ResponseEntity.ok(recommendations);
    }
}
