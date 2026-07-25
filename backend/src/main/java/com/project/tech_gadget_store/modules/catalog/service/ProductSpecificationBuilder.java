package com.project.tech_gadget_store.modules.catalog.service;

import com.project.tech_gadget_store.modules.catalog.dto.request.ProductFilterRequestDto;
import com.project.tech_gadget_store.modules.catalog.entity.Headphones;
import com.project.tech_gadget_store.modules.catalog.entity.Laptop;
import com.project.tech_gadget_store.modules.catalog.entity.Monitor;
import com.project.tech_gadget_store.modules.catalog.entity.Phone;
import com.project.tech_gadget_store.modules.catalog.entity.Product;
import com.project.tech_gadget_store.modules.catalog.entity.ProductSerial;
import com.project.tech_gadget_store.modules.catalog.entity.ProductVariant;
import com.project.tech_gadget_store.modules.catalog.entity.Smartwatch;
import com.project.tech_gadget_store.modules.catalog.entity.enums.SerialStatus;
import com.project.tech_gadget_store.modules.loyalty.entity.Promotion;
import com.project.tech_gadget_store.modules.order.entity.OrderItem;
import com.project.tech_gadget_store.modules.warehouse.entity.ExportLogItem;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

/**
 * Builds the JPA {@link Specification} for product listing/search — every structured filter
 * (brand, category, price range, per-category-type specs, stock/promotion flags, manager KPI
 * filters) lives here so {@link ProductService} stays focused on orchestrating queries and
 * pagination rather than criteria-API plumbing.
 */
@Component
public class ProductSpecificationBuilder {

    /**
     * @param keywordMatchedIds product ids already ranked/filtered by full-text search
     *     ({@link com.project.tech_gadget_store.modules.catalog.repository.ProductRepository#searchProductIdsByKeyword}),
     *     or {@code null} when no keyword search is active.
     */
    public Specification<Product> build(ProductFilterRequestDto f, List<String> keywordMatchedIds) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (f.getActive() != null) {
                predicates.add(cb.equal(root.get("isActive"), f.getActive()));
            } else {
                predicates.add(cb.isTrue(root.get("isActive")));
            }

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
                            cb.treat(root, Smartwatch.class).get("hasGps"), f.getHasGps()));
                }
                if (f.getIsWaterResistant() != null) {
                    predicates.add(cb.equal(
                            cb.treat(root, Smartwatch.class).get("isWaterResistant"), f.getIsWaterResistant()));
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
                    case "inStock" -> {
                        // Has at least 1 IN_STOCK serial
                        Subquery<String> inStockSq = query.subquery(String.class);
                        Root<ProductSerial> isRoot = inStockSq.from(ProductSerial.class);
                        inStockSq.select(isRoot.get("id"));
                        Join<ProductSerial, ProductVariant> isJoin = isRoot.join("productVariant");
                        inStockSq.where(
                            cb.equal(isJoin.get("product"), root),
                            cb.equal(isRoot.get("status"), SerialStatus.IN_STOCK)
                        );
                        predicates.add(cb.exists(inStockSq));
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

    private static boolean hasText(String s) {
        return s != null && !s.isBlank();
    }

    private static boolean hasItems(List<?> list) {
        return list != null && !list.isEmpty();
    }
}
