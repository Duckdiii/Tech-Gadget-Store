package com.project.tech_gadget_store.modules.catalog.service;

import com.project.tech_gadget_store.common.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductResponseDto;
import com.project.tech_gadget_store.modules.catalog.entity.Product;
import com.project.tech_gadget_store.modules.catalog.entity.ProductVariant;
import com.project.tech_gadget_store.modules.catalog.mapper.ProductMapper;
import com.project.tech_gadget_store.modules.catalog.repository.ProductRepository;
import com.project.tech_gadget_store.modules.catalog.repository.ProductVariantRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class RecommendationService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductMapper productMapper;

    public RecommendationService(
            ProductRepository productRepository,
            ProductVariantRepository productVariantRepository,
            ProductMapper productMapper) {
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
        this.productMapper = productMapper;
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
        if (variantsA.isEmpty()) {
            return Collections.emptyList();
        }

        // Determine default variant of Product A (lowest price variant)
        ProductVariant defaultVariantA = variantsA.stream()
                .min(Comparator.comparing(ProductVariant::getPrice))
                .orElseThrow(() -> new ResourceNotFoundException("No configurations found for product: " + productId));

        int targetRam = defaultVariantA.getRamGb() != null ? defaultVariantA.getRamGb() : 0;
        int targetStorage = defaultVariantA.getStorageGb() != null ? defaultVariantA.getStorageGb() : 0;
        BigDecimal targetPrice = defaultVariantA.getPrice();
        String targetBrandId = targetProduct.getBrand().getId();

        // 1. Fetch raw candidate products (same category, different product, active)
        List<Product> candidates = productRepository.findCandidatesForRecommendation(
                targetProduct.getCategory().getId(),
                productId
        );

        if (candidates.isEmpty()) {
            return Collections.emptyList();
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
                .map(sp -> productMapper.toProductResponseDto(sp.product, sp.variants))
                .toList();
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
