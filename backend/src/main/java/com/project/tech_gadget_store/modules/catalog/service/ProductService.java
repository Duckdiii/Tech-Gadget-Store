package com.project.tech_gadget_store.modules.catalog.service;

import com.project.tech_gadget_store.common.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.modules.catalog.dto.request.ProductFilterRequestDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.FlashSaleProductResponseDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductDetailResponseDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductPageResponseDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductResponseDto;
import com.project.tech_gadget_store.modules.catalog.entity.Phone;
import com.project.tech_gadget_store.modules.catalog.entity.Product;
import com.project.tech_gadget_store.modules.catalog.entity.ProductVariant;
import com.project.tech_gadget_store.modules.catalog.mapper.ProductMapper;
import com.project.tech_gadget_store.modules.catalog.repository.ProductRepository;
import com.project.tech_gadget_store.modules.catalog.repository.ProductVariantRepository;
import com.project.tech_gadget_store.modules.loyalty.entity.BundleService;
import com.project.tech_gadget_store.modules.loyalty.entity.Promotion;
import com.project.tech_gadget_store.modules.loyalty.repository.BundleServiceRepository;
import com.project.tech_gadget_store.modules.order.entity.OrderItem;
import com.project.tech_gadget_store.modules.order.repository.OrderRepository;
import com.project.tech_gadget_store.modules.warehouse.entity.ExportLogItem;
import jakarta.persistence.criteria.*;
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

    public ProductService(ProductRepository productRepository,
            BundleServiceRepository bundleServiceRepository,
            ProductMapper productMapper,
            ProductVariantRepository productVariantRepository,
            OrderRepository orderRepository) {
        this.productRepository = productRepository;
        this.bundleServiceRepository = bundleServiceRepository;
        this.productMapper = productMapper;
        this.productVariantRepository = productVariantRepository;
        this.orderRepository = orderRepository;
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
        return rankedIds.stream()
                .map(byId::get)
                .filter(Objects::nonNull)
                .map(p -> productMapper.toProductResponseDto(p, productVariantRepository.findByProductId(p.getId())))
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
        return productMapper.toProductDetailResponseDto(product, variants, activeBundleServices);
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

        Specification<Product> spec = buildSpecification(filter, null);
        Sort sort = resolveSort(filter.getSort());
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

        Specification<Product> spec = buildSpecification(filter, rankedIds);

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
        List<ProductResponseDto> items = products.stream()
                .map(product -> productMapper.toProductResponseDto(
                        product,
                        productVariantRepository.findByProductId(product.getId())))
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
    // Specification builder
    // -------------------------------------------------------------------------

    /**
     * @param keywordMatchedIds product ids already ranked/filtered by full-text search
     *     ({@link ProductRepository#searchProductIdsByKeyword}), or {@code null} when no
     *     keyword search is active.
     */
    private Specification<Product> buildSpecification(ProductFilterRequestDto f, List<String> keywordMatchedIds) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isTrue(root.get("isActive")));

            if (keywordMatchedIds != null) {
                predicates.add(root.get("id").in(keywordMatchedIds));
            }

            if (hasItems(f.getBrandNames())) {
                predicates.add(root.get("brand").get("name").in(f.getBrandNames()));
            }

            if (hasItems(f.getCategoryNames())) {
                predicates.add(root.get("category").get("name").in(f.getCategoryNames()));
            }

            if (f.getMinPrice() != null || f.getMaxPrice() != null) {
                predicates.add(variantPriceInRange(root, query, cb, f.getMinPrice(), f.getMaxPrice()));
            }

            if (hasItems(f.getRamGb())) {
                predicates.add(variantFieldIn(root, query, cb, "ramGb", f.getRamGb()));
            }

            if (hasItems(f.getStorageGb())) {
                predicates.add(variantFieldIn(root, query, cb, "storageGb", f.getStorageGb()));
            }

            if (hasItems(f.getColors())) {
                predicates.add(variantColorIn(root, query, cb, f.getColors()));
            }

            if (hasText(f.getOperatingSystem())) {
                predicates.add(cb.like(cb.lower(cb.treat(root, com.project.tech_gadget_store.modules.catalog.entity.Phone.class).get("operatingSystem")),
                        "%" + f.getOperatingSystem().trim().toLowerCase() + "%"));
            }

            if (f.getMinScreenSize() != null) {
                predicates.add(cb.greaterThanOrEqualTo(cb.treat(root, com.project.tech_gadget_store.modules.catalog.entity.Phone.class).get("screenSize"), f.getMinScreenSize()));
            }
            if (f.getMaxScreenSize() != null) {
                predicates.add(cb.lessThanOrEqualTo(cb.treat(root, com.project.tech_gadget_store.modules.catalog.entity.Phone.class).get("screenSize"), f.getMaxScreenSize()));
            }

            if (f.getMinBatteryCapacity() != null) {
                predicates.add(cb.greaterThanOrEqualTo(cb.treat(root, com.project.tech_gadget_store.modules.catalog.entity.Phone.class).get("batteryCapacity"), f.getMinBatteryCapacity()));
            }
            if (f.getMaxBatteryCapacity() != null) {
                predicates.add(cb.lessThanOrEqualTo(cb.treat(root, com.project.tech_gadget_store.modules.catalog.entity.Phone.class).get("batteryCapacity"), f.getMaxBatteryCapacity()));
            }

            if (hasText(f.getChipset())) {
                predicates.add(cb.like(cb.lower(cb.treat(root, com.project.tech_gadget_store.modules.catalog.entity.Phone.class).get("chipset")),
                        "%" + f.getChipset().trim().toLowerCase() + "%"));
            }

            if (f.getNfcSupported() != null) {
                predicates.add(cb.equal(cb.treat(root, com.project.tech_gadget_store.modules.catalog.entity.Phone.class).get("nfcSupported"), f.getNfcSupported()));
            }

            if (hasText(f.getSimType())) {
                predicates.add(cb.like(cb.lower(cb.treat(root, com.project.tech_gadget_store.modules.catalog.entity.Phone.class).get("simType")),
                        "%" + f.getSimType().trim().toLowerCase() + "%"));
            }

            if (Boolean.TRUE.equals(f.getOnlyAvailable())) {
                predicates.add(hasAvailableVariant(root, query, cb));
            }

            if (Boolean.TRUE.equals(f.getOnPromotion())) {
                predicates.add(hasActivePromotion(root, query, cb));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Predicate variantPriceInRange(Root<Product> root, CriteriaQuery<?> query,
            CriteriaBuilder cb, BigDecimal min, BigDecimal max) {
        Subquery<String> sq = query.subquery(String.class);
        Root<ProductVariant> v = sq.from(ProductVariant.class);
        sq.select(v.get("id"));
        List<Predicate> predicates = new ArrayList<>();
        predicates.add(cb.equal(v.get("product"), root));
        if (min != null)
            predicates.add(cb.greaterThanOrEqualTo(v.get("price"), min));
        if (max != null)
            predicates.add(cb.lessThanOrEqualTo(v.get("price"), max));
        sq.where(predicates.toArray(new Predicate[0]));
        return cb.exists(sq);
    }

    private <T> Predicate variantFieldIn(Root<Product> root, CriteriaQuery<?> query,
            CriteriaBuilder cb, String field, List<T> values) {
        Subquery<String> sq = query.subquery(String.class);
        Root<ProductVariant> v = sq.from(ProductVariant.class);
        sq.select(v.get("id"));
        sq.where(cb.equal(v.get("product"), root), v.get(field).in(values));
        return cb.exists(sq);
    }

    private Predicate variantColorIn(Root<Product> root, CriteriaQuery<?> query,
            CriteriaBuilder cb, List<String> colors) {
        Subquery<String> sq = query.subquery(String.class);
        Root<ProductVariant> v = sq.from(ProductVariant.class);
        sq.select(v.get("id"));
        List<Predicate> colorPredicates = colors.stream()
                .map(c -> (Predicate) cb.like(cb.lower(v.get("color")), "%" + c.trim().toLowerCase() + "%"))
                .collect(Collectors.toList());
        sq.where(cb.equal(v.get("product"), root), cb.or(colorPredicates.toArray(new Predicate[0])));
        return cb.exists(sq);
    }

    private Predicate hasAvailableVariant(Root<Product> root, CriteriaQuery<?> query,
            CriteriaBuilder cb) {
        Subquery<String> exportedSq = query.subquery(String.class);
        Root<ExportLogItem> eli = exportedSq.from(ExportLogItem.class);
        exportedSq.select(eli.get("productVariant").get("id"));

        Subquery<String> orderedSq = query.subquery(String.class);
        Root<OrderItem> oi = orderedSq.from(OrderItem.class);
        orderedSq.select(oi.get("productVariant").get("id"));

        Subquery<String> sq = query.subquery(String.class);
        Root<ProductVariant> v = sq.from(ProductVariant.class);
        sq.select(v.get("id"));
        sq.where(
                cb.equal(v.get("product"), root),
                cb.not(v.get("id").in(exportedSq)),
                cb.not(v.get("id").in(orderedSq)));
        return cb.exists(sq);
    }

    private Predicate hasActivePromotion(Root<Product> root, CriteriaQuery<?> query,
            CriteriaBuilder cb) {
        LocalDateTime now = LocalDateTime.now();
        Subquery<String> sq = query.subquery(String.class);
        Root<Product> sub = sq.from(Product.class);
        sq.select(sub.get("id"));
        Join<Product, Promotion> promo = sub.join("promotions");
        sq.where(
                cb.equal(sub.get("id"), root.get("id")),
                cb.isTrue(promo.get("active")),
                cb.lessThanOrEqualTo(promo.get("startAt"), now),
                cb.greaterThanOrEqualTo(promo.get("endAt"), now));
        return cb.exists(sq);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private Sort resolveSort(String sort) {
        if (sort == null)
            return Sort.by("createdAt").descending();
        return switch (sort) {
            case "price_asc" -> Sort.by("minPrice").ascending();
            case "price_desc" -> Sort.by("minPrice").descending();
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

    private static boolean hasItems(List<?> list) {
        return list != null && !list.isEmpty();
    }
}
