package com.project.tech_gadget_store.modules.catalog.service;

import com.project.tech_gadget_store.common.exception.ResourceNotFoundException;
import com.project.tech_gadget_store.modules.catalog.dto.request.ProductFilterRequestDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.FlashSaleProductResponseDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductDetailResponseDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductPageResponseDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductResponseDto;
import com.project.tech_gadget_store.modules.catalog.entity.Headphones;
import com.project.tech_gadget_store.modules.catalog.entity.Laptop;
import com.project.tech_gadget_store.modules.catalog.entity.Monitor;
import com.project.tech_gadget_store.modules.catalog.entity.Phone;
import com.project.tech_gadget_store.modules.catalog.entity.Product;
import com.project.tech_gadget_store.modules.catalog.entity.ProductImage;
import com.project.tech_gadget_store.modules.catalog.entity.ProductSerial;
import com.project.tech_gadget_store.modules.catalog.entity.ProductVariant;
import com.project.tech_gadget_store.modules.catalog.entity.enums.SerialStatus;
import com.project.tech_gadget_store.modules.catalog.mapper.ProductMapper;
import com.project.tech_gadget_store.modules.catalog.repository.ProductRepository;
import com.project.tech_gadget_store.modules.catalog.repository.ProductVariantRepository;
import com.project.tech_gadget_store.modules.loyalty.entity.BundleService;
import com.project.tech_gadget_store.modules.loyalty.entity.Promotion;
import com.project.tech_gadget_store.modules.loyalty.repository.BundleServiceRepository;
import com.project.tech_gadget_store.modules.order.entity.OrderItem;
import com.project.tech_gadget_store.modules.order.repository.OrderRepository;
import com.project.tech_gadget_store.modules.review.repository.ReviewRepository;
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
    private final ReviewRepository reviewRepository;

    public ProductService(ProductRepository productRepository,
            BundleServiceRepository bundleServiceRepository,
            ProductMapper productMapper,
            ProductVariantRepository productVariantRepository,
            OrderRepository orderRepository,
            ReviewRepository reviewRepository) {
        this.productRepository = productRepository;
        this.bundleServiceRepository = bundleServiceRepository;
        this.productMapper = productMapper;
        this.productVariantRepository = productVariantRepository;
        this.orderRepository = orderRepository;
        this.reviewRepository = reviewRepository;
    }

    /** [productId -> [averageRating, reviewCount]] for a batch of products — avoids N+1 review queries per list. */
    private Map<String, Object[]> fetchRatingStats(List<String> productIds) {
        Map<String, Object[]> ratingMap = new HashMap<>();
        for (Object[] row : reviewRepository.findRatingStatsByProductIds(productIds)) {
            double avg = ((Number) row[1]).doubleValue();
            int count = ((Number) row[2]).intValue();
            ratingMap.put((String) row[0], new Object[] { avg, count });
        }
        return ratingMap;
    }

    private Double ratingOf(Map<String, Object[]> ratingMap, String productId) {
        Object[] stat = ratingMap.get(productId);
        return stat != null ? (Double) stat[0] : null;
    }

    private Integer reviewCountOf(Map<String, Object[]> ratingMap, String productId) {
        Object[] stat = ratingMap.get(productId);
        return stat != null ? (Integer) stat[1] : 0;
    }

    /**
     * Batch-load số lượng serial IN_STOCK theo productId — 1 query duy nhất thay vì N query.
     * Kết quả: [productId -> availableCount]
     */
    private Map<String, Long> fetchStockCounts(List<String> productIds) {
        if (productIds == null || productIds.isEmpty()) return Map.of();
        Map<String, Long> stockMap = new java.util.HashMap<>();
        // Khởi tạo mặc định 0 cho tất cả productId (phòng trường hợp không có serial nào)
        for (String pid : productIds) stockMap.put(pid, 0L);
        // 1 query GROUP BY duy nhất thay vì N query riêng lẻ
        for (Object[] row : productVariantRepository.countAvailablePhysicalUnitsByProductIds(productIds)) {
            stockMap.put((String) row[0], ((Number) row[1]).longValue());
        }
        return stockMap;
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
        List<Object[]> salesCountsObj = orderRepository.countProductSalesForList(pIds);
        Map<String, Integer> salesCountMap = new java.util.HashMap<>();
        for (Object[] obj : salesCountsObj) {
            salesCountMap.put((String) obj[0], ((Number) obj[1]).intValue());
        }
        Map<String, Object[]> ratingMap = fetchRatingStats(pIds);
        Map<String, Long> stockMap = fetchStockCounts(pIds);

        return products.stream()
                .map(p -> productMapper.toProductResponseDto(
                        p,
                        productVariantRepository.findByProductId(p.getId()),
                        salesCountMap.getOrDefault(p.getId(), 0),
                        ratingOf(ratingMap, p.getId()),
                        reviewCountOf(ratingMap, p.getId()),
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

        Specification<Product> spec = buildSpecification(filter, null);

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
        List<Object[]> salesCountsObj = orderRepository.countProductSalesForList(productIds);
        Map<String, Integer> salesCountMap = new java.util.HashMap<>();
        for (Object[] obj : salesCountsObj) {
            salesCountMap.put((String) obj[0], ((Number) obj[1]).intValue());
        }
        Map<String, Object[]> ratingMap = fetchRatingStats(productIds);
        Map<String, Long> stockMap = fetchStockCounts(productIds);

        List<ProductResponseDto> items = products.stream()
                .map(product -> productMapper.toProductResponseDto(
                        product,
                        productVariantRepository.findByProductId(product.getId()),
                        salesCountMap.getOrDefault(product.getId(), 0),
                        ratingOf(ratingMap, product.getId()),
                        reviewCountOf(ratingMap, product.getId()),
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

            // ---- Phone-specific filters (only applied when filtering by Phone category or no category selected) ----
            boolean isPhoneFilter = !hasItems(f.getCategoryNames())
                    || f.getCategoryNames().stream().anyMatch(n -> n.toLowerCase().contains("điện thoại") || n.toLowerCase().contains("phone"));

            if (isPhoneFilter) {
                if (hasText(f.getOperatingSystem())) {
                    predicates.add(cb.like(
                            cb.lower(cb.treat(root, Phone.class).get("operatingSystem")),
                            "%" + f.getOperatingSystem().trim().toLowerCase() + "%"));
                }
                if (f.getMinScreenSize() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(
                            cb.treat(root, Phone.class).get("screenSize"), f.getMinScreenSize()));
                }
                if (f.getMaxScreenSize() != null) {
                    predicates.add(cb.lessThanOrEqualTo(
                            cb.treat(root, Phone.class).get("screenSize"), f.getMaxScreenSize()));
                }
                if (f.getMinBatteryCapacity() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(
                            cb.treat(root, Phone.class).get("batteryCapacity"), f.getMinBatteryCapacity()));
                }
                if (f.getMaxBatteryCapacity() != null) {
                    predicates.add(cb.lessThanOrEqualTo(
                            cb.treat(root, Phone.class).get("batteryCapacity"), f.getMaxBatteryCapacity()));
                }
                if (hasText(f.getChipset())) {
                    predicates.add(cb.like(
                            cb.lower(cb.treat(root, Phone.class).get("chipset")),
                            "%" + f.getChipset().trim().toLowerCase() + "%"));
                }
                if (f.getNfcSupported() != null) {
                    predicates.add(cb.equal(
                            cb.treat(root, Phone.class).get("nfcSupported"), f.getNfcSupported()));
                }
                if (hasText(f.getSimType())) {
                    predicates.add(cb.like(
                            cb.lower(cb.treat(root, Phone.class).get("simType")),
                            "%" + f.getSimType().trim().toLowerCase() + "%"));
                }
            }

            // ---- Laptop-specific filters ----
            boolean isLaptopFilter = hasItems(f.getCategoryNames())
                    && f.getCategoryNames().stream().anyMatch(n -> n.toLowerCase().contains("laptop"));
            if (isLaptopFilter) {
                if (hasText(f.getCpuKeyword())) {
                    predicates.add(cb.like(
                            cb.lower(cb.treat(root, Laptop.class).get("cpu")),
                            "%" + f.getCpuKeyword().trim().toLowerCase() + "%"));
                }
                if (hasText(f.getGpuKeyword())) {
                    predicates.add(cb.like(
                            cb.lower(cb.treat(root, Laptop.class).get("gpu")),
                            "%" + f.getGpuKeyword().trim().toLowerCase() + "%"));
                }
                if (f.getMinWeight() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(
                            cb.treat(root, Laptop.class).get("weight"), f.getMinWeight()));
                }
                if (f.getMaxWeight() != null) {
                    predicates.add(cb.lessThanOrEqualTo(
                            cb.treat(root, Laptop.class).get("weight"), f.getMaxWeight()));
                }
            }

            // ---- Monitor-specific filters ----
            boolean isMonitorFilter = hasItems(f.getCategoryNames())
                    && f.getCategoryNames().stream().anyMatch(n -> n.toLowerCase().contains("màn hình") || n.toLowerCase().contains("monitor"));
            if (isMonitorFilter) {
                if (f.getMinRefreshRate() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(
                            cb.treat(root, Monitor.class).get("refreshRate"), f.getMinRefreshRate()));
                }
                if (f.getMaxRefreshRate() != null) {
                    predicates.add(cb.lessThanOrEqualTo(
                            cb.treat(root, Monitor.class).get("refreshRate"), f.getMaxRefreshRate()));
                }
                if (hasText(f.getPanelType())) {
                    predicates.add(cb.like(
                            cb.lower(cb.treat(root, Monitor.class).get("panelType")),
                            "%" + f.getPanelType().trim().toLowerCase() + "%"));
                }
            }

            // ---- Headphones-specific filters ----
            boolean isHeadphonesFilter = hasItems(f.getCategoryNames())
                    && f.getCategoryNames().stream().anyMatch(n -> n.toLowerCase().contains("tai nghe") || n.toLowerCase().contains("headphone"));
            if (isHeadphonesFilter) {
                if (f.getIsWireless() != null) {
                    predicates.add(cb.equal(
                            cb.treat(root, Headphones.class).get("isWireless"), f.getIsWireless()));
                }
                if (f.getHasNoiseCancelling() != null) {
                    predicates.add(cb.equal(
                            cb.treat(root, Headphones.class).get("hasNoiseCancelling"), f.getHasNoiseCancelling()));
                }
            }

            // ---- Smartwatch-specific filters ----
            boolean isSmartwatchFilter = hasItems(f.getCategoryNames())
                    && f.getCategoryNames().stream().anyMatch(n -> n.toLowerCase().contains("smartwatch") || n.toLowerCase().contains("đồng hồ"));
            if (isSmartwatchFilter) {
                if (f.getHasGps() != null) {
                    predicates.add(cb.equal(
                            cb.treat(root, com.project.tech_gadget_store.modules.catalog.entity.Smartwatch.class).get("hasGps"), f.getHasGps()));
                }
                if (f.getIsWaterResistant() != null) {
                    predicates.add(cb.equal(
                            cb.treat(root, com.project.tech_gadget_store.modules.catalog.entity.Smartwatch.class).get("isWaterResistant"), f.getIsWaterResistant()));
                }
            }

            if (Boolean.TRUE.equals(f.getOnlyAvailable())) {
                predicates.add(hasAvailableVariant(root, query, cb));
            }

            if (Boolean.TRUE.equals(f.getOnPromotion())) {
                predicates.add(hasActivePromotion(root, query, cb));
            }

            // ---- KPI stockFilter (manager-only) ----
            if (f.getStockFilter() != null) {
                switch (f.getStockFilter()) {
                    case "noVariants" -> {
                        Subquery<String> noVarSq = query.subquery(String.class);
                        Root<ProductVariant> vRoot = noVarSq.from(ProductVariant.class);
                        noVarSq.select(vRoot.get("id"));
                        noVarSq.where(cb.equal(vRoot.get("product"), root));
                        predicates.add(cb.not(cb.exists(noVarSq)));
                    }
                    case "noImages" -> {
                        // ProductImage has no @ManyToOne back to Product; use the collection path
                        predicates.add(cb.isEmpty(root.get("images")));
                    }
                    case "outOfStock" -> {
                        // Has at least 1 variant...
                        Subquery<String> hasSq = query.subquery(String.class);
                        Root<ProductVariant> hvRoot = hasSq.from(ProductVariant.class);
                        hasSq.select(hvRoot.get("id"));
                        hasSq.where(cb.equal(hvRoot.get("product"), root));
                        predicates.add(cb.exists(hasSq));
                        // ...but no IN_STOCK serial
                        Subquery<String> stockSq = query.subquery(String.class);
                        Root<ProductSerial> psRoot = stockSq.from(ProductSerial.class);
                        stockSq.select(psRoot.get("id"));
                        Join<ProductSerial, ProductVariant> psJoin = psRoot.join("productVariant");
                        stockSq.where(
                            cb.equal(psJoin.get("product"), root),
                            cb.equal(psRoot.get("status"), SerialStatus.IN_STOCK)
                        );
                        predicates.add(cb.not(cb.exists(stockSq)));
                    }
                    default -> {} // ignore unknown values
                }
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
