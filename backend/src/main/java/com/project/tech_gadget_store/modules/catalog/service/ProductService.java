package com.project.tech_gadget_store.modules.catalog.service;

import com.project.tech_gadget_store.common.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.modules.catalog.dto.request.ProductFilterRequestDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.FlashSaleProductResponseDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductDetailResponseDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductPageResponseDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductResponseDto;
import com.project.tech_gadget_store.modules.catalog.entity.Product;
import com.project.tech_gadget_store.modules.catalog.entity.ProductVariant;
import com.project.tech_gadget_store.modules.catalog.mapper.ProductMapper;
import com.project.tech_gadget_store.modules.catalog.repository.ProductRepository;
import com.project.tech_gadget_store.modules.catalog.repository.ProductVariantRepository;
import com.project.tech_gadget_store.modules.catalog.service.ProductStatsAggregator.RatingStat;
import com.project.tech_gadget_store.modules.loyalty.entity.BundleService;
import com.project.tech_gadget_store.modules.loyalty.entity.Promotion;
import com.project.tech_gadget_store.modules.loyalty.repository.BundleServiceRepository;
import com.project.tech_gadget_store.modules.order.repository.OrderRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;



@Service
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final BundleServiceRepository bundleServiceRepository;
    private final ProductMapper productMapper;
    private final ProductVariantRepository productVariantRepository;
    private final OrderRepository orderRepository;
    private final ProductSpecificationBuilder productSpecificationBuilder;
    private final ProductStatsAggregator productStatsAggregator;

    public ProductService(ProductRepository productRepository,
            BundleServiceRepository bundleServiceRepository,
            ProductMapper productMapper,
            ProductVariantRepository productVariantRepository,
            OrderRepository orderRepository,
            ProductSpecificationBuilder productSpecificationBuilder,
            ProductStatsAggregator productStatsAggregator) {
        this.productRepository = productRepository;
        this.bundleServiceRepository = bundleServiceRepository;
        this.productMapper = productMapper;
        this.productVariantRepository = productVariantRepository;
        this.orderRepository = orderRepository;
        this.productSpecificationBuilder = productSpecificationBuilder;
        this.productStatsAggregator = productStatsAggregator;
    }

    /** Top-selling products (by total confirmed order quantity) — used for the homepage "Bán chạy" tab. */
    public List<ProductResponseDto> findBestsellingProducts(int limit) {
        List<Object[]> rows = orderRepository.findBestsellingProductIds(PageRequest.of(0, limit));
        List<String> rankedIds = rows.stream().map(r -> (String) r[0]).toList();
        if (rankedIds.isEmpty()) {
            return List.of();
        }
        Map<String, Product> byId = productRepository.findAllById(rankedIds).stream()
                .filter(Product::getIsActive)
                .collect(Collectors.toMap(Product::getId, p -> p));
        List<Product> products = rankedIds.stream()
                .map(byId::get)
                .filter(Objects::nonNull)
                .toList();

        if (products.isEmpty()) {
            return List.of();
        }

        List<String> pIds = products.stream().map(Product::getId).toList();
        Map<String, Integer> salesCountMap = productStatsAggregator.fetchSalesCounts(pIds);
        Map<String, RatingStat> ratingMap = productStatsAggregator.fetchRatingStats(pIds);
        Map<String, Long> stockMap = productStatsAggregator.fetchStockCounts(pIds);

        return products.stream()
                .map(p -> productMapper.toProductResponseDto(
                        p,
                        productVariantRepository.findByProductId(p.getId()),
                        salesCountMap.getOrDefault(p.getId(), 0),
                        ProductStatsAggregator.ratingOf(ratingMap, p.getId()),
                        ProductStatsAggregator.reviewCountOf(ratingMap, p.getId()),
                        stockMap.getOrDefault(p.getId(), 0L)))
                .toList();
    }

    /** Max page size allowed for public product listing to prevent DoS / OOM. */
    private static final int MAX_PAGE_SIZE = 100;

    /**
     * Returns a paginated product listing. Replaces the old unbounded {@code findAll()}
     * to prevent OOM / DoS on the public endpoint.
     *
     * @param page 0-based page index (default 0)
     * @param size items per page (default 20, max {@value #MAX_PAGE_SIZE})
     */
    public ProductPageResponseDto findAll(int page, int size) {
        int cappedSize = Math.min(size, MAX_PAGE_SIZE);
        ProductFilterRequestDto emptyFilter = new ProductFilterRequestDto();
        emptyFilter.setPage(page);
        emptyFilter.setSize(cappedSize);
        return findProductsByFilter(emptyFilter);
    }

    public ProductDetailResponseDto viewDetailProduct(String id) {
        Product product = productRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("This product is no longer available"));
        List<ProductVariant> variants = productVariantRepository.findByProductId(id);
        List<BundleService> activeBundleServices = bundleServiceRepository.findByActiveTrue();
        Integer salesCount = orderRepository.countSalesByProductId(id);
        return productMapper.toProductDetailResponseDto(product, variants, activeBundleServices, salesCount);
    }

    public List<FlashSaleProductResponseDto> findTodayFlashSaleProducts() {
        LocalDateTime now = LocalDateTime.now();
        return productRepository.findTodayFlashSaleProducts(now).stream()
                .map(product -> {
                    List<ProductVariant> variants = productVariantRepository.findByProductId(product.getId());
                    return productMapper.toFlashSaleProductResponseDto(
                            product,
                            findBestActivePromotion(product, now),
                            findCheapestVariant(variants));
                })
                .toList();
    }

    /** Max full-text keyword matches considered, before other filters/pagination are applied. */
    private static final int MAX_KEYWORD_MATCHES = 2000;

    public ProductPageResponseDto findProductsByFilter(ProductFilterRequestDto filter) {
        int page = filter.getPage() != null ? filter.getPage() : 0;
        int size = filter.getSize() != null ? filter.getSize() : 20;
        int cappedSize = Math.min(size, MAX_PAGE_SIZE);

        if (hasText(filter.getKeyword())) {
            return findProductsByKeywordSearch(filter, page, cappedSize);
        }

        Specification<Product> spec = productSpecificationBuilder.build(filter, null);

        String sortType = filter.getSort();
        if ("price_asc".equals(sortType) || "price_desc".equals(sortType)) {
            List<Product> allProducts = productRepository.findAll(spec);

            // Map product to its min variant price
            Map<String, BigDecimal> minPrices = new java.util.HashMap<>();
            for (Product p : allProducts) {
                List<ProductVariant> variants = productVariantRepository.findByProductId(p.getId());
                BigDecimal min = variants.stream()
                        .map(ProductVariant::getPrice)
                        .filter(Objects::nonNull)
                        .min(BigDecimal::compareTo)
                        .orElse(BigDecimal.ZERO);
                minPrices.put(p.getId(), min);
            }

            // Sort
            List<Product> sortedList = new ArrayList<>(allProducts);
            if ("price_asc".equals(sortType)) {
                sortedList.sort(Comparator.comparing(p -> minPrices.getOrDefault(p.getId(), BigDecimal.ZERO)));
            } else {
                sortedList.sort(Comparator.comparing((Product p) -> minPrices.getOrDefault(p.getId(), BigDecimal.ZERO)).reversed());
            }

            int totalItems = sortedList.size();
            int totalPages = (int) Math.ceil(totalItems / (double) cappedSize);
            int fromIndex = Math.min(page * cappedSize, totalItems);
            int toIndex = Math.min(fromIndex + cappedSize, totalItems);
            List<Product> pageContent = sortedList.subList(fromIndex, toIndex);

            return toPageResponseDto(pageContent, page, cappedSize, totalItems, totalPages);
        }

        Sort sort = resolveSort(sortType);
        Page<Product> productPage = productRepository.findAll(spec, PageRequest.of(page, cappedSize, sort));

        return toPageResponseDto(productPage.getContent(), page, cappedSize,
                productPage.getTotalElements(), productPage.getTotalPages());
    }

    /**
     * Handles keyword search: ranks matching product ids via full-text search, then combines
     * that ranked set with the other structured filters (brand/price/RAM/...). If the caller
     * didn't request an explicit sort, results are ordered by relevance (best match first)
     * across all pages; an explicit sort (e.g. price_asc) is respected via normal DB pagination.
     */
    private ProductPageResponseDto findProductsByKeywordSearch(ProductFilterRequestDto filter, int page, int size) {
        List<String> rankedIds = productRepository.searchProductIdsByKeyword(filter.getKeyword().trim(), MAX_KEYWORD_MATCHES);
        if (rankedIds.isEmpty()) {
            return toPageResponseDto(List.of(), page, size, 0, 0);
        }

        Specification<Product> spec = productSpecificationBuilder.build(filter, rankedIds);

        if (hasText(filter.getSort())) {
            Sort sort = resolveSort(filter.getSort());
            Page<Product> productPage = productRepository.findAll(spec, PageRequest.of(page, size, sort));
            return toPageResponseDto(productPage.getContent(), page, size,
                    productPage.getTotalElements(), productPage.getTotalPages());
        }

        Map<String, Integer> rankIndex = new HashMap<>();
        for (int i = 0; i < rankedIds.size(); i++) {
            rankIndex.put(rankedIds.get(i), i);
        }
        List<Product> sorted = productRepository.findAll(spec).stream()
                .sorted(Comparator.comparing(p -> rankIndex.getOrDefault(p.getId(), Integer.MAX_VALUE)))
                .toList();

        int totalItems = sorted.size();
        int totalPages = (int) Math.ceil(totalItems / (double) size);
        int fromIndex = Math.min(page * size, totalItems);
        int toIndex = Math.min(fromIndex + size, totalItems);

        return toPageResponseDto(sorted.subList(fromIndex, toIndex), page, size, totalItems, totalPages);
    }

    private ProductPageResponseDto toPageResponseDto(List<Product> products, int page, int size,
            long totalItems, int totalPages) {
        if (products.isEmpty()) {
            return ProductPageResponseDto.builder()
                    .items(List.of())
                    .page(page)
                    .size(size)
                    .totalItems(totalItems)
                    .totalPages(totalPages)
                    .build();
        }

        List<String> productIds = products.stream().map(Product::getId).toList();
        Map<String, Integer> salesCountMap = productStatsAggregator.fetchSalesCounts(productIds);
        Map<String, RatingStat> ratingMap = productStatsAggregator.fetchRatingStats(productIds);
        Map<String, Long> stockMap = productStatsAggregator.fetchStockCounts(productIds);
        Map<String, List<ProductVariant>> variantsMap = productVariantRepository.findVariantsForProductIds(productIds)
                .stream()
                .collect(Collectors.groupingBy(v -> v.getProduct().getId()));

        List<ProductResponseDto> items = products.stream()
                .map(product -> productMapper.toProductResponseDto(
                        product,
                        variantsMap.getOrDefault(product.getId(), List.of()),
                        salesCountMap.getOrDefault(product.getId(), 0),
                        ProductStatsAggregator.ratingOf(ratingMap, product.getId()),
                        ProductStatsAggregator.reviewCountOf(ratingMap, product.getId()),
                        stockMap.getOrDefault(product.getId(), 0L)))
                .toList();

        return ProductPageResponseDto.builder()
                .items(items)
                .page(page)
                .size(size)
                .totalItems(totalItems)
                .totalPages(totalPages)
                .build();
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private Sort resolveSort(String sort) {
        if (sort == null)
            return Sort.by("createdAt").descending();
        return switch (sort) {
            case "name_asc" -> Sort.by("name").ascending();
            case "name_desc" -> Sort.by("name").descending();
            default -> Sort.by("createdAt").descending();
        };
    }

    private Promotion findBestActivePromotion(Product product, LocalDateTime now) {
        return product.getPromotions().stream()
                .filter(p -> Boolean.TRUE.equals(p.getActive()))
                .filter(p -> p.getDiscountPercent() != null)
                .filter(p -> !p.getStartAt().isAfter(now))
                .filter(p -> !p.getEndAt().isBefore(now))
                .max(Comparator.comparing(Promotion::getDiscountPercent))
                .orElseThrow(
                        () -> new IllegalStateException("No active promotion found for product: " + product.getId()));
    }

    private ProductVariant findCheapestVariant(List<ProductVariant> variants) {
        return variants.stream()
                .filter(v -> v.getPrice() != null)
                .min(Comparator.comparing(ProductVariant::getPrice))
                .orElse(null);
    }

    private static boolean hasText(String s) {
        return s != null && !s.isBlank();
    }
}
