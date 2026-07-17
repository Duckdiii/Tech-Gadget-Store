package com.project.tech_gadget_store.seed;

import com.project.tech_gadget_store.modules.catalog.entity.ProductSerial;
import com.project.tech_gadget_store.modules.catalog.entity.ProductVariant;
import com.project.tech_gadget_store.modules.catalog.entity.enums.SerialStatus;
import com.project.tech_gadget_store.modules.catalog.repository.ProductSerialRepository;
import com.project.tech_gadget_store.modules.catalog.repository.ProductVariantRepository;
import jakarta.persistence.EntityManager;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Seeds {@code product_serials} — physical-unit tracking is a newer addition than
 * {@link CustomerOrderSeeder}'s quantity-based {@code OrderItem} history, so without this
 * seeder every availability check (cart, checkout, export) sees zero stock for every variant.
 *
 * Idempotent by design rather than gated by a single "table is empty" check: an environment can
 * already carry a handful of {@code ProductSerial} rows from manual testing (checkout/export
 * calls against the running app) without having real bulk stock, so this only tops up what's
 * actually missing on each run:
 *  1. One SOLD serial for any order item that doesn't already have one linked via
 *     {@code invoiceItemId}, so the warranty lookup
 *     ({@link com.project.tech_gadget_store.modules.catalog.controller.WarrantyController}) has
 *     real serial numbers to resolve against real orders.
 *  2. Enough IN_STOCK serials per variant to reach a healthy random floor, so add-to-cart/
 *     checkout/export have real inventory to sell against going forward.
 *
 * Both passes work off id-only projections (never raw entity references) so that the periodic
 * {@code flush()}/{@code clear()} needed to keep memory bounded at this volume can't leave a
 * detached entity dangling off a to-be-persisted {@code ProductSerial}.
 *
 * Runs after {@link CatalogSeeder} (needs variants) and {@link CustomerOrderSeeder} (needs order
 * items for pass 1). Only active under the "seed" profile.
 */
@Component
@Profile("seed")
@Order(3)
@RequiredArgsConstructor
@Slf4j
public class ProductSerialSeeder implements CommandLineRunner {

    private static final int MIN_STOCK_PER_VARIANT = 10;
    private static final int MAX_STOCK_PER_VARIANT = 40;
    private static final long RANDOM_SEED = 20240815L;
    /** Flush/clear cadence to keep the persistence context from growing unbounded across thousands of serials. */
    private static final int FLUSH_EVERY_N_SERIALS = 500;

    private final ProductVariantRepository productVariantRepository;
    private final ProductSerialRepository productSerialRepository;
    private final EntityManager entityManager;

    private final Random random = new Random(RANDOM_SEED);

    private record OrderItemSeed(String id, String variantId, int quantity) {
    }

    @Override
    @Transactional
    public void run(String... args) {
        List<String> variantIds = productVariantRepository.findAll().stream().map(ProductVariant::getId).toList();
        if (variantIds.isEmpty()) {
            log.warn("[ProductSerialSeeder] No product variants found — run CatalogSeeder first. Skipping.");
            return;
        }

        int saved = 0;

        // Pass 1: one SOLD serial for every order item that doesn't already have one.
        Set<String> alreadyLinkedInvoiceItemIds = new HashSet<>(entityManager
                .createQuery("SELECT ps.invoiceItemId FROM ProductSerial ps WHERE ps.invoiceItemId IS NOT NULL", String.class)
                .getResultList());

        List<OrderItemSeed> orderItems = entityManager.createQuery(
                "SELECT new " + OrderItemSeed.class.getName() + "(" +
                        "oi.id, oi.productVariant.id, oi.quantity) FROM OrderItem oi",
                OrderItemSeed.class).getResultList();

        int soldCount = 0;
        for (OrderItemSeed item : orderItems) {
            if (alreadyLinkedInvoiceItemIds.contains(item.id())) {
                continue;
            }
            for (int i = 0; i < item.quantity(); i++) {
                productSerialRepository.save(ProductSerial.builder()
                        .productVariant(entityManager.getReference(ProductVariant.class, item.variantId()))
                        .serialNumber(nextSerialNumber())
                        .status(SerialStatus.SOLD)
                        .invoiceItemId(item.id())
                        .build());
                soldCount++;
                saved = flushPeriodically(saved);
            }
        }

        // Pass 2: top up each variant's IN_STOCK pool to a healthy random floor.
        int inStockCount = 0;
        for (String variantId : variantIds) {
            long currentInStock = productSerialRepository.countByProductVariantIdAndStatus(variantId, SerialStatus.IN_STOCK);
            if (currentInStock >= MIN_STOCK_PER_VARIANT) {
                continue;
            }
            int target = MIN_STOCK_PER_VARIANT + random.nextInt(MAX_STOCK_PER_VARIANT - MIN_STOCK_PER_VARIANT + 1);
            int toCreate = (int) (target - currentInStock);
            for (int i = 0; i < toCreate; i++) {
                productSerialRepository.save(ProductSerial.builder()
                        .productVariant(entityManager.getReference(ProductVariant.class, variantId))
                        .serialNumber(nextSerialNumber())
                        .status(SerialStatus.IN_STOCK)
                        .build());
                inStockCount++;
                saved = flushPeriodically(saved);
            }
        }

        log.info("[ProductSerialSeeder] Seeded {} sold serials (for {} previously-unlinked order items) and {} in-stock serials across {} variants.",
                soldCount, orderItems.size(), inStockCount, variantIds.size());
    }

    private int flushPeriodically(int savedSoFar) {
        int count = savedSoFar + 1;
        if (count % FLUSH_EVERY_N_SERIALS == 0) {
            entityManager.flush();
            entityManager.clear();
        }
        return count;
    }

    private String nextSerialNumber() {
        return "SR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
