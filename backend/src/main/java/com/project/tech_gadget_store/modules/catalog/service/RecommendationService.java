package com.project.tech_gadget_store.modules.catalog.service;

import com.project.tech_gadget_store.common.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.modules.catalog.dto.response.ForYouItemDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ForYouRecommendationResponseDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductResponseDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.RecommendationExperimentSummaryDto;
import com.project.tech_gadget_store.modules.catalog.entity.CustomerRecommendationCache;
import com.project.tech_gadget_store.modules.catalog.entity.Product;
import com.project.tech_gadget_store.modules.catalog.entity.ProductVariant;
import com.project.tech_gadget_store.modules.catalog.entity.RecommendationExperimentLog;
import com.project.tech_gadget_store.modules.catalog.mapper.ProductMapper;
import com.project.tech_gadget_store.modules.catalog.repository.CustomerRecommendationCacheRepository;
import com.project.tech_gadget_store.modules.catalog.repository.ProductRepository;
import com.project.tech_gadget_store.modules.catalog.repository.ProductVariantRepository;
import com.project.tech_gadget_store.modules.catalog.repository.RecommendationExperimentLogRepository;
import com.project.tech_gadget_store.modules.catalog.service.ProductStatsAggregator.RatingStat;
import com.project.tech_gadget_store.modules.order.repository.OrderRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class RecommendationService {

    private static final int FOR_YOU_LIMIT = 6;
    private static final int RECENTLY_VIEWED_LIMIT = 5;
    /** Placeholder id passed to "NOT IN" native queries when there is nothing real to exclude. */
    private static final List<String> NO_EXCLUSIONS = List.of("00000000-0000-0000-0000-000000000000");

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final OrderRepository orderRepository;
    private final CustomerRecommendationCacheRepository customerRecommendationCacheRepository;
    private final RecommendationExperimentLogRepository recommendationExperimentLogRepository;
    private final RecentlyViewedService recentlyViewedService;
    private final ProductMapper productMapper;
    private final ProductStatsAggregator productStatsAggregator;

    public RecommendationService(
            ProductRepository productRepository,
            ProductVariantRepository productVariantRepository,
            OrderRepository orderRepository,
            CustomerRecommendationCacheRepository customerRecommendationCacheRepository,
            RecommendationExperimentLogRepository recommendationExperimentLogRepository,
            RecentlyViewedService recentlyViewedService,
            ProductMapper productMapper,
            ProductStatsAggregator productStatsAggregator) {
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
        this.orderRepository = orderRepository;
        this.customerRecommendationCacheRepository = customerRecommendationCacheRepository;
        this.recommendationExperimentLogRepository = recommendationExperimentLogRepository;
        this.recentlyViewedService = recentlyViewedService;
        this.productMapper = productMapper;
        this.productStatsAggregator = productStatsAggregator;
    }

    /**
     * Get a list of similar products based on the content-based recommendation algorithm (Product level).
     *
     * @param productId The ID of the target product being viewed.
     * @return List of up to 6 similar products mapped to ProductResponseDto.
     */
    public List<ProductResponseDto> getSimilarProducts(String productId) {
        Product targetProduct = productRepository.findByIdAndIsActiveTrue(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));

        List<ProductVariant> variantsA = productVariantRepository.findByProductId(productId);
        List<ScoredProduct> topScored = computeTopScored(targetProduct, variantsA);
        return mapScoredToDtos(topScored);
    }

    /**
     * Content-based similarity scoring (steps 1-4 of the algorithm) for a single target product,
     * given its already-loaded variants. Extracted from {@link #getSimilarProducts} so
     * {@link #getSuggestionsFromHistory} can fan out over several target products while batching
     * the stats-aggregator lookups once at the end instead of once per target (N+1).
     */
    private List<ScoredProduct> computeTopScored(Product targetProduct, List<ProductVariant> variantsA) {
        if (variantsA.isEmpty()) {
            return List.of();
        }

        // Determine default variant of Product A (lowest price variant)
        ProductVariant defaultVariantA = variantsA.stream()
                .min(Comparator.comparing(ProductVariant::getPrice))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No configurations found for product: " + targetProduct.getId()));

        int targetRam = defaultVariantA.getRamGb() != null ? defaultVariantA.getRamGb() : 0;
        int targetStorage = defaultVariantA.getStorageGb() != null ? defaultVariantA.getStorageGb() : 0;
        BigDecimal targetPrice = defaultVariantA.getPrice();
        String targetBrandId = targetProduct.getBrand().getId();

        // 1. Fetch raw candidate products (same category, different product, active)
        List<Product> candidates = productRepository.findCandidatesForRecommendation(
                targetProduct.getCategory().getId(),
                targetProduct.getId()
        );

        if (candidates.isEmpty()) {
            return List.of();
        }

        // 2. Fetch all variants of candidate products to avoid N+1 query issue
        List<String> candidateIds = candidates.stream().map(Product::getId).toList();
        List<ProductVariant> allCandidateVariants = productVariantRepository.findVariantsForProductIds(candidateIds);
        Map<String, List<ProductVariant>> variantsByProductId = allCandidateVariants.stream()
                .collect(Collectors.groupingBy(pv -> pv.getProduct().getId()));

        // 3. Compute similarity scores
        List<ScoredProduct> scoredProducts = new ArrayList<>();
        for (Product p : candidates) {
            List<ProductVariant> pVariants = variantsByProductId.getOrDefault(p.getId(), Collections.emptyList());
            if (pVariants.isEmpty()) {
                continue;
            }

            // Find lowest price of B
            BigDecimal minPriceB = pVariants.stream()
                    .map(ProductVariant::getPrice)
                    .filter(Objects::nonNull)
                    .min(BigDecimal::compareTo)
                    .orElse(null);

            if (minPriceB == null || targetPrice == null) {
                continue;
            }

            // A. Brand Score (max 30 points)
            double brandScore = p.getBrand().getId().equals(targetBrandId) ? 30.0 : 0.0;

            // B. Price Score (max 50 points)
            double priceDiffPct = minPriceB.subtract(targetPrice).abs().doubleValue() / targetPrice.doubleValue();
            double priceScore = 0.0;
            if (priceDiffPct <= 0.40) {
                priceScore = 50.0 * (1.0 - priceDiffPct);
            } else {
                // If price difference is > 40%, we exclude it from recommendations by giving a very low total score
                continue;
            }

            // C. Specs Score (max 20 points)
            // RAM Matching (10 points): max(RAM_B) >= RAM_Default_A
            int maxRamB = pVariants.stream()
                    .map(ProductVariant::getRamGb)
                    .filter(Objects::nonNull)
                    .mapToInt(Integer::intValue)
                    .max()
                    .orElse(0);
            double ramScore = (targetRam > 0 && maxRamB >= targetRam) ? 10.0 : 0.0;

            // Storage Matching (10 points): max(Storage_B) >= Storage_Default_A
            int maxStorageB = pVariants.stream()
                    .map(ProductVariant::getStorageGb)
                    .filter(Objects::nonNull)
                    .mapToInt(Integer::intValue)
                    .max()
                    .orElse(0);
            double storageScore = (targetStorage > 0 && maxStorageB >= targetStorage) ? 10.0 : 0.0;

            double totalScore = brandScore + priceScore + ramScore + storageScore;
            scoredProducts.add(new ScoredProduct(p, pVariants, totalScore));
        }

        // 4. Sort by score descending and return Top 6
        return scoredProducts.stream()
                .sorted(Comparator.comparingDouble((ScoredProduct sp) -> sp.score).reversed())
                .limit(6)
                .toList();
    }

    /** Batches the stats-aggregator lookups once for the given scored products, then maps to DTOs. */
    private List<ProductResponseDto> mapScoredToDtos(List<ScoredProduct> scored) {
        if (scored.isEmpty()) {
            return List.of();
        }

        List<String> ids = scored.stream().map(sp -> sp.product.getId()).toList();
        Map<String, Integer> salesCountMap = productStatsAggregator.fetchSalesCounts(ids);
        Map<String, RatingStat> ratingMap = productStatsAggregator.fetchRatingStats(ids);
        Map<String, Long> stockMap = productStatsAggregator.fetchStockCounts(ids);

        return scored.stream()
                .map(sp -> productMapper.toProductResponseDto(
                        sp.product,
                        sp.variants,
                        salesCountMap.getOrDefault(sp.product.getId(), 0),
                        ProductStatsAggregator.ratingOf(ratingMap, sp.product.getId()),
                        ProductStatsAggregator.reviewCountOf(ratingMap, sp.product.getId()),
                        stockMap.getOrDefault(sp.product.getId(), 0L)))
                .toList();
    }

    /**
     * Get a list of frequently bought together products (Co-occurrence) for a single product.
     * Fallback to Content-Based if there are less than 6 recommendations.
     */
    public List<ProductResponseDto> getFrequentlyBoughtTogether(String productId) {
        List<String> boughtTogetherIds = productRepository.findFrequentlyBoughtTogetherIds(productId, 6);
        List<ProductResponseDto> dtos = mapProductsToDtos(fetchProductsInOrder(boughtTogetherIds));

        if (dtos.size() < 6) {
            List<ProductResponseDto> similar = getSimilarProducts(productId);
            for (ProductResponseDto s : similar) {
                if (dtos.size() >= 6) {
                    break;
                }
                boolean exists = dtos.stream().anyMatch(d -> d.getId().equals(s.getId()));
                if (!exists) {
                    dtos.add(s);
                }
            }
        }

        return dtos;
    }

    /**
     * Get a list of frequently bought together products (Co-occurrence) for multiple products (Cart).
     * Fallback to Content-Based of the first product if there are less than 6 recommendations.
     */
    public List<ProductResponseDto> getCartRecommendations(List<String> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<String> boughtTogetherIds = productRepository.findFrequentlyBoughtTogetherIdsForMultipleProducts(productIds, 6);
        List<ProductResponseDto> dtos = mapProductsToDtos(fetchProductsInOrder(boughtTogetherIds));

        if (dtos.size() < 6) {
            String firstProductId = productIds.get(0);
            List<ProductResponseDto> similar = getSimilarProducts(firstProductId);
            for (ProductResponseDto s : similar) {
                if (dtos.size() >= 6) {
                    break;
                }
                // Exclude products already in the cart
                if (productIds.contains(s.getId())) {
                    continue;
                }
                boolean exists = dtos.stream().anyMatch(d -> d.getId().equals(s.getId()));
                if (!exists) {
                    dtos.add(s);
                }
            }
        }

        return dtos;
    }

    /**
     * "Dành cho bạn". Checks the ml-service's batch-computed Matrix Factorization cache
     * first (real personalization); falls back to the MVP rule-based logic below when the
     * cache has nothing for this customer yet (brand-new customer / not seen by the last
     * training run — the model hasn't caught up to them yet).
     *
     * A/B test: among customers who DO have an MF cache (a real choice exists), a stable hash
     * of customerId holds back ~half into rule-based anyway (variant RULE_BASED_HOLDOUT), so
     * click-through rate between MF and rule-based can be compared on real traffic — not just
     * ml-service's offline precision@6 backtest. Cold-start customers (no cache, no real choice)
     * are served rule-based as before but excluded from the experiment (variant left null, no
     * log rows) so they don't dilute the comparison. See RecommendationExperimentLog.
     */
    @Transactional
    public ForYouRecommendationResponseDto getForYouRecommendations(String customerId) {
        List<CustomerRecommendationCache> cached =
                customerRecommendationCacheRepository.findByCustomerIdOrderByRankAsc(customerId);

        String variant;
        List<ProductResponseDto> products;
        if (!cached.isEmpty()) {
            boolean isHoldout = Math.floorMod(customerId.hashCode(), 2) == 1;
            if (isHoldout) {
                variant = "RULE_BASED_HOLDOUT";
                products = getForYouRecommendationsMvp(customerId);
            } else {
                variant = "MF";
                List<String> cachedProductIds =
                        cached.stream().map(CustomerRecommendationCache::getProductId).toList();
                products = mapProductsToDtos(fetchProductsInOrder(cachedProductIds));
            }
        } else {
            variant = null;
            products = getForYouRecommendationsMvp(customerId);
        }

        List<ForYouItemDto> items = products.stream()
                .map(p -> ForYouItemDto.builder()
                        .impressionId(variant != null ? logImpression(customerId, variant, p.getId()) : null)
                        .product(p)
                        .build())
                .toList();
        return ForYouRecommendationResponseDto.builder().variant(variant).items(items).build();
    }

    private String logImpression(String customerId, String variant, String productId) {
        RecommendationExperimentLog log = new RecommendationExperimentLog(customerId, variant, productId);
        return recommendationExperimentLogRepository.save(log).getId();
    }

    /** Số liệu tổng hợp CTR theo variant cho trang báo cáo Manager. */
    public List<RecommendationExperimentSummaryDto> getExperimentSummary() {
        return recommendationExperimentLogRepository.countShownAndClickedByVariant().stream()
                .map(row -> {
                    long shown = (long) row[1];
                    long clicked = ((Number) row[2]).longValue();
                    double ctr = shown == 0 ? 0.0 : (double) clicked / shown * 100.0;
                    return RecommendationExperimentSummaryDto.builder()
                            .variant((String) row[0])
                            .shownCount(shown)
                            .clickedCount(clicked)
                            .ctr(ctr)
                            .build();
                })
                .toList();
    }

    /** Đánh dấu khách đã bấm vào 1 sản phẩm gợi ý — chỉ chủ nhân impression đó mới ghi được. */
    @Transactional
    public void markImpressionClicked(String impressionId, String customerId) {
        RecommendationExperimentLog log = recommendationExperimentLogRepository
                .findByIdAndCustomerId(impressionId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Impression not found: " + impressionId));
        log.markClicked();
    }

    /**
     * MVP fallback (no ML): top sellers within the categories a customer has bought from
     * before, excluding products they already own. Falls back further to site-wide top
     * sellers for cold-start customers (no purchase history) and to pad out results when the
     * category-scoped list is too short.
     */
    private List<ProductResponseDto> getForYouRecommendationsMvp(String customerId) {
        List<String> purchasedCategoryIds = orderRepository.findPurchasedCategoryIdsByCustomerId(customerId);
        List<String> purchasedProductIds = orderRepository.findPurchasedProductIdsByCustomerId(customerId);
        List<String> excludeIds = purchasedProductIds.isEmpty() ? NO_EXCLUSIONS : purchasedProductIds;

        List<String> topSellingIds = new ArrayList<>(purchasedCategoryIds.isEmpty()
                ? productRepository.findTopSellingIdsOverall(excludeIds, FOR_YOU_LIMIT)
                : productRepository.findTopSellingIdsByCategoriesExcluding(purchasedCategoryIds, excludeIds, FOR_YOU_LIMIT));

        if (topSellingIds.size() < FOR_YOU_LIMIT) {
            List<String> seenProductIds = new ArrayList<>(purchasedProductIds);
            seenProductIds.addAll(topSellingIds);
            List<String> fallbackExcludeIds = seenProductIds.isEmpty() ? NO_EXCLUSIONS : seenProductIds;
            List<String> fallbackIds = productRepository.findTopSellingIdsOverall(fallbackExcludeIds, FOR_YOU_LIMIT);
            for (String id : fallbackIds) {
                if (topSellingIds.size() >= FOR_YOU_LIMIT) {
                    break;
                }
                topSellingIds.add(id);
            }
        }

        return mapProductsToDtos(fetchProductsInOrder(topSellingIds));
    }

    /**
     * Records that a customer viewed a product's detail page — powers "Bạn vừa xem" and
     * "Gợi ý từ lịch sử". Only called for logged-in customers (see {@code ProductController});
     * anonymous views are never logged. No existence validation needed here: the customer is
     * already resolved by the caller, and a bogus productId is harmlessly dropped later by
     * {@link #fetchProductsInOrder}.
     */
    public void recordView(String customerId, String productId) {
        recentlyViewedService.recordView(customerId, productId);
    }

    /** "Bạn vừa xem" — the customer's own view history, most recent first, no ranking logic. */
    public List<ProductResponseDto> getRecentlyViewed(String customerId) {
        return mapProductsToDtos(fetchProductsInOrder(getRecentlyViewedProductIds(customerId)));
    }

    /**
     * "Gợi ý từ lịch sử" — reuses the same content-based scoring as {@link #getSimilarProducts}
     * for each of the customer's recently viewed products, merging results and excluding both
     * duplicates and the viewed products themselves.
     *
     * Unlike calling {@link #getSimilarProducts} once per viewed product (up to
     * {@link #RECENTLY_VIEWED_LIMIT} times, each issuing its own stats-aggregator queries — an
     * N+1 fan-out), this batches the target-product/variant lookups and the final stats-aggregator
     * lookup once across all viewed products. A viewed product that's since gone inactive/missing
     * is silently skipped rather than aborting the whole suggestion list.
     */
    public List<ProductResponseDto> getSuggestionsFromHistory(String customerId) {
        List<String> recentProductIds = getRecentlyViewedProductIds(customerId);
        if (recentProductIds.isEmpty()) {
            return Collections.emptyList();
        }

        Map<String, Product> viewedProductsById = productRepository.findAllById(recentProductIds).stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsActive()))
                .collect(Collectors.toMap(Product::getId, p -> p));
        Map<String, List<ProductVariant>> viewedVariantsByProductId =
                productVariantRepository.findVariantsForProductIds(recentProductIds).stream()
                        .collect(Collectors.groupingBy(pv -> pv.getProduct().getId()));

        Set<String> seen = new HashSet<>(recentProductIds);
        List<ScoredProduct> merged = new ArrayList<>();
        for (String viewedProductId : recentProductIds) {
            if (merged.size() >= FOR_YOU_LIMIT) {
                break;
            }
            Product targetProduct = viewedProductsById.get(viewedProductId);
            if (targetProduct == null) {
                continue;
            }
            List<ProductVariant> variantsA =
                    viewedVariantsByProductId.getOrDefault(viewedProductId, Collections.emptyList());
            for (ScoredProduct candidate : computeTopScored(targetProduct, variantsA)) {
                if (merged.size() >= FOR_YOU_LIMIT) {
                    break;
                }
                if (seen.add(candidate.product.getId())) {
                    merged.add(candidate);
                }
            }
        }

        return mapScoredToDtos(merged);
    }

    /** Up to {@link #RECENTLY_VIEWED_LIMIT} distinct, most-recently-viewed product ids. */
    private List<String> getRecentlyViewedProductIds(String customerId) {
        return recentlyViewedService.getRecentProductIds(customerId, RECENTLY_VIEWED_LIMIT);
    }

    /** Re-fetches full entities for the given ids, preserving the ids' order (findAllById does not). */
    private List<Product> fetchProductsInOrder(List<String> ids) {
        if (ids.isEmpty()) {
            return List.of();
        }
        Map<String, Product> byId = productRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(Product::getId, p -> p));
        return ids.stream().map(byId::get).filter(Objects::nonNull).toList();
    }

    private List<ProductResponseDto> mapProductsToDtos(List<Product> products) {
        if (products.isEmpty()) {
            return new ArrayList<>();
        }
        List<String> productIds = products.stream().map(Product::getId).toList();
        List<ProductVariant> variants = productVariantRepository.findVariantsForProductIds(productIds);
        Map<String, List<ProductVariant>> variantsByProductId = variants.stream()
                .collect(Collectors.groupingBy(pv -> pv.getProduct().getId()));

        Map<String, Integer> salesCountMap = productStatsAggregator.fetchSalesCounts(productIds);
        Map<String, RatingStat> ratingMap = productStatsAggregator.fetchRatingStats(productIds);
        Map<String, Long> stockMap = productStatsAggregator.fetchStockCounts(productIds);

        List<ProductResponseDto> result = new ArrayList<>();
        for (Product p : products) {
            List<ProductVariant> pVariants = variantsByProductId.getOrDefault(p.getId(), Collections.emptyList());
            result.add(productMapper.toProductResponseDto(p, pVariants, salesCountMap.getOrDefault(p.getId(), 0),
                    ProductStatsAggregator.ratingOf(ratingMap, p.getId()), ProductStatsAggregator.reviewCountOf(ratingMap, p.getId()),
                    stockMap.getOrDefault(p.getId(), 0L)));
        }
        return result;
    }

    private static class ScoredProduct {
        final Product product;
        final List<ProductVariant> variants;
        final double score;

        ScoredProduct(Product product, List<ProductVariant> variants, double score) {
            this.product = product;
            this.variants = variants;
            this.score = score;
        }
    }
}
