package com.project.tech_gadget_store.seed;

import com.project.tech_gadget_store.modules.catalog.repository.ProductRepository;
import jakarta.persistence.EntityManager;
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
 * Tops up dry, one-line product descriptions already sitting in the DB with the same richer,
 * multi-sentence copy {@link CatalogSeeder} now generates for fresh seeds — needed because
 * seeding is one-shot ({@link CatalogSeeder} skips once categories exist), so an environment
 * seeded before this change keeps its old descriptions forever unless something backfills them.
 *
 * Idempotent by word count rather than a table-empty check: a description is left alone once
 * it's long enough to already be "rich" (either from a previous run of this seeder, or a manual
 * edit), so re-running is always safe and only touches what's still dry. Works off id-only
 * projections (see {@link ProductSerialSeeder} for why) and updates via bulk JPQL rather than
 * loading managed entities, since the associations needed (category/brand names) are lazy and
 * this only needs to write one scalar column.
 *
 * Runs after {@link CatalogSeeder} (needs products to exist).
 */
@Component
@Order(4)
@RequiredArgsConstructor
@Slf4j
public class ProductDescriptionSeeder implements CommandLineRunner {

    /** Descriptions at or above this word count are assumed already "rich" and left untouched. */
    private static final int MIN_RICH_WORD_COUNT = 15;
    private static final long RANDOM_SEED = 20240901L;
    /** The literal filler {@link CatalogSeeder} used to give procedurally-generated products before this change — not a real opening sentence, so it's discarded rather than kept as one. */
    private static final String GENERIC_FILLER = "Sản phẩm mở rộng danh mục, dùng để tăng độ đa dạng cho recommendation system.";

    private final ProductRepository productRepository;
    private final EntityManager entityManager;

    private final Random random = new Random(RANDOM_SEED);

    private record ProductSeed(String id, String name, String description, String categoryName, String brandName) {
    }

    private record VariantSeed(String productId, Integer ramGb, Integer storageGb, String color, BigDecimal price) {
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (productRepository.count() == 0) {
            log.warn("[ProductDescriptionSeeder] No products found — run CatalogSeeder first. Skipping.");
            return;
        }

        List<ProductSeed> products = entityManager.createQuery(
                "SELECT new " + ProductSeed.class.getName() + "(" +
                        "p.id, p.name, p.description, p.category.name, p.brand.name) FROM Product p",
                ProductSeed.class).getResultList();

        List<VariantSeed> variants = entityManager.createQuery(
                "SELECT new " + VariantSeed.class.getName() + "(" +
                        "v.product.id, v.ramGb, v.storageGb, v.color, v.price) FROM ProductVariant v",
                VariantSeed.class).getResultList();
        Map<String, List<VariantSeed>> variantsByProductId = variants.stream()
                .collect(Collectors.groupingBy(VariantSeed::productId));

        int updated = 0;
        int skipped = 0;
        for (ProductSeed product : products) {
            if (isAlreadyRich(product.description())) {
                skipped++;
                continue;
            }

            List<VariantSeed> productVariants = variantsByProductId.getOrDefault(product.id(), List.of());
            List<Integer> ramOptions = productVariants.stream().map(VariantSeed::ramGb).filter(Objects::nonNull).distinct().toList();
            List<Integer> storageOptions = productVariants.stream().map(VariantSeed::storageGb).filter(Objects::nonNull).distinct().toList();
            List<String> colors = productVariants.stream().map(VariantSeed::color).filter(Objects::nonNull).distinct().toList();
            BigDecimal minPrice = productVariants.stream().map(VariantSeed::price).filter(Objects::nonNull)
                    .min(Comparator.naturalOrder()).orElse(null);

            String openingBlurb = GENERIC_FILLER.equals(product.description()) ? null : product.description();
            String newDescription = ProductDescriptionGenerator.generate(
                    product.categoryName(), product.brandName(), product.name(),
                    openingBlurb, ramOptions, storageOptions, colors, minPrice, random);

            entityManager.createQuery("UPDATE Product p SET p.description = :desc WHERE p.id = :id")
                    .setParameter("desc", newDescription)
                    .setParameter("id", product.id())
                    .executeUpdate();
            updated++;
        }

        log.info("[ProductDescriptionSeeder] Enriched {} product descriptions ({} already rich, left unchanged).",
                updated, skipped);
    }

    private boolean isAlreadyRich(String description) {
        if (description == null || description.isBlank() || GENERIC_FILLER.equals(description)) return false;
        return description.strip().split("\\s+").length >= MIN_RICH_WORD_COUNT;
    }
}
