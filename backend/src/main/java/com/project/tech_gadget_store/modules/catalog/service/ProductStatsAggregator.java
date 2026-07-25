package com.project.tech_gadget_store.modules.catalog.service;

import com.project.tech_gadget_store.modules.catalog.repository.ProductVariantRepository;
import com.project.tech_gadget_store.modules.order.repository.OrderRepository;
import com.project.tech_gadget_store.modules.review.repository.ReviewRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

/**
 * Batch-loads the per-product numbers (rating, stock, sales count) needed when mapping a list of
 * products to DTOs — one query per stat regardless of list size, instead of N+1 per product.
 * Shared by {@link ProductService} and {@link RecommendationService}, which both map product
 * lists to {@code ProductResponseDto} the same way.
 */
@Component
public class ProductStatsAggregator {

    public record RatingStat(double average, int count) {}

    private final ReviewRepository reviewRepository;
    private final ProductVariantRepository productVariantRepository;
    private final OrderRepository orderRepository;

    public ProductStatsAggregator(ReviewRepository reviewRepository,
            ProductVariantRepository productVariantRepository,
            OrderRepository orderRepository) {
        this.reviewRepository = reviewRepository;
        this.productVariantRepository = productVariantRepository;
        this.orderRepository = orderRepository;
    }

    /** productId -> {average rating, review count}, only present for products that have reviews. */
    public Map<String, RatingStat> fetchRatingStats(List<String> productIds) {
        Map<String, RatingStat> ratingMap = new HashMap<>();
        for (Object[] row : reviewRepository.findRatingStatsByProductIds(productIds)) {
            double avg = ((Number) row[1]).doubleValue();
            int count = ((Number) row[2]).intValue();
            ratingMap.put((String) row[0], new RatingStat(avg, count));
        }
        return ratingMap;
    }

    /** productId -> count of IN_STOCK serials across all its variants. Always present, defaults to 0. */
    public Map<String, Long> fetchStockCounts(List<String> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            return Map.of();
        }
        Map<String, Long> stockMap = new HashMap<>();
        for (String pid : productIds) {
            stockMap.put(pid, 0L);
        }
        for (Object[] row : productVariantRepository.countAvailablePhysicalUnitsByProductIds(productIds)) {
            stockMap.put((String) row[0], ((Number) row[1]).longValue());
        }
        return stockMap;
    }

    /** productId -> total confirmed order quantity. Only present for products with sales. */
    public Map<String, Integer> fetchSalesCounts(List<String> productIds) {
        Map<String, Integer> salesCountMap = new HashMap<>();
        for (Object[] row : orderRepository.countProductSalesForList(productIds)) {
            salesCountMap.put((String) row[0], ((Number) row[1]).intValue());
        }
        return salesCountMap;
    }

    public static Double ratingOf(Map<String, RatingStat> ratingMap, String productId) {
        RatingStat stat = ratingMap.get(productId);
        return stat != null ? stat.average() : null;
    }

    public static Integer reviewCountOf(Map<String, RatingStat> ratingMap, String productId) {
        RatingStat stat = ratingMap.get(productId);
        return stat != null ? stat.count() : 0;
    }
}
