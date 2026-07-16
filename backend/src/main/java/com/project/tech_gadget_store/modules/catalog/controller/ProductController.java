package com.project.tech_gadget_store.modules.catalog.controller;

import com.project.tech_gadget_store.modules.auth.entity.Customer;
import com.project.tech_gadget_store.modules.auth.repository.CustomerRepository;
import com.project.tech_gadget_store.modules.catalog.dto.request.ProductFilterRequestDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.FlashSaleProductResponseDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.NlSearchResponseDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductDetailResponseDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductPageResponseDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductResponseDto;
import com.project.tech_gadget_store.modules.catalog.service.ProductNlSearchService;
import com.project.tech_gadget_store.modules.catalog.service.ProductService;
import com.project.tech_gadget_store.modules.catalog.service.ProductViewerTrackerService;
import com.project.tech_gadget_store.modules.catalog.service.RecommendationService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;




@RestController
@RequestMapping("/api/products")
public class ProductController {

    private static final Logger log = LoggerFactory.getLogger(ProductController.class);

    private final ProductService productService;
    private final ProductNlSearchService productNlSearchService;
    private final RecommendationService recommendationService;
    private final ProductViewerTrackerService productViewerTrackerService;
    private final CustomerRepository customerRepository;

    public ProductController(
            ProductService productService,
            ProductNlSearchService productNlSearchService,
            RecommendationService recommendationService,
            ProductViewerTrackerService productViewerTrackerService,
            CustomerRepository customerRepository) {
        this.productService = productService;
        this.productNlSearchService = productNlSearchService;
        this.recommendationService = recommendationService;
        this.productViewerTrackerService = productViewerTrackerService;
        this.customerRepository = customerRepository;
    }

    @GetMapping
    public ResponseEntity<ProductPageResponseDto> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(productService.findAll(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDetailResponseDto> getById(@PathVariable String id, Authentication authentication) {
        recordViewIfLoggedIn(id, authentication);
        return ResponseEntity.ok(productService.viewDetailProduct(id));
    }

    @GetMapping("/{id}/viewers")
    public ResponseEntity<Map<String, Long>> getViewerCount(
            @PathVariable String id, @RequestParam String visitorId) {
        long count = productViewerTrackerService.recordViewerAndCount(id, visitorId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @GetMapping("/flash-sale-today")
    public ResponseEntity<List<FlashSaleProductResponseDto>> getTodayFlashSaleProducts() {
        return ResponseEntity.ok(productService.findTodayFlashSaleProducts());
    }

    @GetMapping("/filter")
    public ResponseEntity<ProductPageResponseDto> getByFilter(
            @Valid @ModelAttribute ProductFilterRequestDto filter) {
        return ResponseEntity.ok(productService.findProductsByFilter(filter));
    }

    /**
     * Tìm kiếm bằng câu hỏi tiếng Việt tự nhiên (vd. "điện thoại chụp ảnh đẹp dưới 15 triệu có
     * 5G") — model dịch câu hỏi thành bộ lọc có cấu trúc rồi chạy lại {@link #getByFilter}.
     */
    @GetMapping("/search-nl")
    public ResponseEntity<NlSearchResponseDto> searchNaturalLanguage(@RequestParam String q) {
        return ResponseEntity.ok(productNlSearchService.search(q));
    }

    /**
     * Logs the view for "Bạn vừa xem" / "Gợi ý từ lịch sử" when the caller is a logged-in
     * customer. This endpoint is public (anonymous browsing allowed), so authentication may be
     * an {@link AnonymousAuthenticationToken} — in that case, silently skip logging. Any
     * failure here must never break the product detail response itself.
     */
    private void recordViewIfLoggedIn(String productId, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            return;
        }
        try {
            Customer customer = customerRepository.findByAccountEmail(authentication.getName()).orElse(null);
            if (customer != null) {
                recommendationService.recordView(customer.getId(), productId);
            }
        } catch (Exception e) {
            log.warn("Không ghi được view log cho product {}: {}", productId, e.getMessage());
        }
    }
}
