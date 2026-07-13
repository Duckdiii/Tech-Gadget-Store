package com.project.tech_gadget_store.modules.catalog.controller;

import com.project.tech_gadget_store.modules.auth.entity.Customer;
import com.project.tech_gadget_store.modules.auth.repository.CustomerRepository;
import com.project.tech_gadget_store.modules.catalog.dto.response.ForYouRecommendationResponseDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductResponseDto;
import com.project.tech_gadget_store.modules.catalog.service.RecommendationService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/products")
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final CustomerRepository customerRepository;

    public RecommendationController(RecommendationService recommendationService, CustomerRepository customerRepository) {
        this.recommendationService = recommendationService;
        this.customerRepository = customerRepository;
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

    @GetMapping("/for-you")
    public ResponseEntity<ForYouRecommendationResponseDto> getForYouRecommendations(Authentication authentication) {
        String customerId = resolveCustomerId(authentication);
        ForYouRecommendationResponseDto recommendations = recommendationService.getForYouRecommendations(customerId);
        return ResponseEntity.ok(recommendations);
    }

    @PostMapping("/for-you/impressions/{impressionId}/click")
    public ResponseEntity<Void> markForYouClicked(@PathVariable String impressionId, Authentication authentication) {
        String customerId = resolveCustomerId(authentication);
        recommendationService.markImpressionClicked(impressionId, customerId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/recently-viewed")
    public ResponseEntity<List<ProductResponseDto>> getRecentlyViewed(Authentication authentication) {
        String customerId = resolveCustomerId(authentication);
        List<ProductResponseDto> recentlyViewed = recommendationService.getRecentlyViewed(customerId);
        return ResponseEntity.ok(recentlyViewed);
    }

    @GetMapping("/suggestions-from-history")
    public ResponseEntity<List<ProductResponseDto>> getSuggestionsFromHistory(Authentication authentication) {
        String customerId = resolveCustomerId(authentication);
        List<ProductResponseDto> suggestions = recommendationService.getSuggestionsFromHistory(customerId);
        return ResponseEntity.ok(suggestions);
    }

    private String resolveCustomerId(Authentication authentication) {
        Customer customer = customerRepository.findByAccountEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy khách hàng"));
        return customer.getId();
    }
}
