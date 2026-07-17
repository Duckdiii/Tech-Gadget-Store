package com.project.tech_gadget_store.seed;

import com.project.tech_gadget_store.modules.catalog.entity.Headphones;
import com.project.tech_gadget_store.modules.catalog.entity.Laptop;
import com.project.tech_gadget_store.modules.catalog.entity.Monitor;
import com.project.tech_gadget_store.modules.catalog.entity.Phone;
import com.project.tech_gadget_store.modules.catalog.entity.Product;
import com.project.tech_gadget_store.modules.catalog.entity.ProductVariant;
import com.project.tech_gadget_store.modules.catalog.entity.Smartwatch;
import com.project.tech_gadget_store.modules.catalog.repository.ProductRepository;
import com.project.tech_gadget_store.modules.catalog.repository.ProductVariantRepository;
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Random;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Fills in the technical spec fields (screen, chipset, battery, ...) that {@link ProductFactory}
 * leaves null — {@link CatalogSeeder} now sets them for fresh products via
 * {@link ProductSpecApplier}, but seeding is one-shot, so an environment seeded before this
 * change keeps every spec field null forever (this is exactly why the product detail page's
 * specs tab showed "N/A" for everything) unless something backfills it.
 *
 * Idempotent by checking each product's subtype-specific "has this been filled in" field (e.g. a
 * phone's chipset) rather than a table-empty check, so re-running only touches rows still
 * missing specs. Small volume (one row per product, no fan-out), so unlike
 * {@link ProductSerialSeeder} this just loads managed entities and lets the transaction flush —
 * no periodic clear() needed.
 *
 * Runs after {@link CatalogSeeder} (needs products) and {@link ProductVariantRepository} data
 * being seeded (needs variants for price-tier calculation).
 */
@Component
@Order(5)
@RequiredArgsConstructor
@Slf4j
public class ProductSpecSeeder implements CommandLineRunner {

    private static final long RANDOM_SEED = 20241001L;

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;

    private final Random random = new Random(RANDOM_SEED);

    @Override
    @Transactional
    public void run(String... args) {
        List<Product> products = productRepository.findAll();
        if (products.isEmpty()) {
            log.warn("[ProductSpecSeeder] No products found — run CatalogSeeder first. Skipping.");
            return;
        }

        List<String> productIds = products.stream().map(Product::getId).toList();
        Map<String, List<ProductVariant>> variantsByProductId = productVariantRepository
                .findVariantsForProductIds(productIds).stream()
                .collect(Collectors.groupingBy(v -> v.getProduct().getId()));

        int updated = 0;
        int skipped = 0;
        for (Product product : products) {
            if (!ProductSpecApplier.hasSpecFields(product) || isAlreadyFilled(product)) {
                skipped++;
                continue;
            }

            List<ProductVariant> variants = variantsByProductId.getOrDefault(product.getId(), List.of());
            BigDecimal minPrice = variants.stream().map(ProductVariant::getPrice).filter(Objects::nonNull)
                    .min(Comparator.naturalOrder()).orElse(null);

            ProductSpecApplier.apply(product, product.getCategory().getName(), product.getBrand().getName(), minPrice, random);
            updated++;
        }

        log.info("[ProductSpecSeeder] Filled technical specs for {} products ({} already had specs, left unchanged).",
                updated, skipped);
    }

    private boolean isAlreadyFilled(Product product) {
        if (product instanceof Phone phone) return phone.getChipset() != null;
        if (product instanceof Laptop laptop) return laptop.getCpu() != null;
        if (product instanceof Monitor monitor) return monitor.getResolution() != null;
        if (product instanceof Headphones headphones) return headphones.getConnectorType() != null;
        if (product instanceof Smartwatch smartwatch) return smartwatch.getBatteryLifeDays() != null;
        return true;
    }
}
