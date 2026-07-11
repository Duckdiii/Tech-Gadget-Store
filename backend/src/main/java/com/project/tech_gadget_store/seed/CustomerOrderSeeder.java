package com.project.tech_gadget_store.seed;

import com.project.tech_gadget_store.modules.auth.entity.Account;
import com.project.tech_gadget_store.modules.auth.entity.Address;
import com.project.tech_gadget_store.modules.auth.entity.Customer;
import com.project.tech_gadget_store.modules.auth.entity.enums.AccountStatus;
import com.project.tech_gadget_store.modules.auth.repository.AccountRepository;
import com.project.tech_gadget_store.modules.auth.repository.CustomerRepository;
import com.project.tech_gadget_store.modules.catalog.entity.FavoriteProduct;
import com.project.tech_gadget_store.modules.catalog.entity.Product;
import com.project.tech_gadget_store.modules.catalog.entity.ProductVariant;
import com.project.tech_gadget_store.modules.catalog.repository.FavoriteProductRepository;
import com.project.tech_gadget_store.modules.catalog.repository.ProductRepository;
import com.project.tech_gadget_store.modules.catalog.repository.ProductVariantRepository;
import com.project.tech_gadget_store.modules.loyalty.entity.Membership;
import com.project.tech_gadget_store.modules.loyalty.entity.MembershipBenefit;
import com.project.tech_gadget_store.modules.loyalty.entity.enums.MembershipTier;
import com.project.tech_gadget_store.modules.loyalty.entity.enums.SubscriptionStatus;
import com.project.tech_gadget_store.modules.loyalty.repository.MembershipRepository;
import com.project.tech_gadget_store.modules.order.entity.Order;
import com.project.tech_gadget_store.modules.order.entity.OrderItem;
import com.project.tech_gadget_store.modules.order.entity.enums.OrderStatus;
import com.project.tech_gadget_store.modules.order.repository.OrderRepository;
import com.project.tech_gadget_store.modules.payment.entity.CODPaymentMethod;
import com.project.tech_gadget_store.modules.payment.repository.CODPaymentMethodRepository;
import com.project.tech_gadget_store.seed.PersonaCatalog.CategoryBrandAffinity;
import com.project.tech_gadget_store.seed.PersonaCatalog.Persona;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Seeds fake Customer + Order + OrderItem history driven by {@link PersonaCatalog}, so the
 * resulting purchase data has a realistic latent structure (persona-correlated buying
 * patterns, long-tail order frequency) instead of uniform noise. This gives the future
 * collaborative-filtering / matrix-factorization recommender real signal to learn from.
 *
 * Runs after {@link CatalogSeeder} (see {@code @Order}) since it needs the catalog to exist.
 * Only active under the "seed" profile; skips entirely if customers already exist.
 */
@Component
@Profile("seed")
@org.springframework.core.annotation.Order(2)
@RequiredArgsConstructor
@Slf4j
public class CustomerOrderSeeder implements CommandLineRunner {

    private static final int TOTAL_CUSTOMERS = 300;
    private static final double BASE_ORDERS_PER_CUSTOMER = 12.0;
    /** Chance an order item ignores persona affinity entirely, to avoid unrealistically clean data. */
    private static final double NOISE_PICK_PROBABILITY = 0.15;
    private static final long RANDOM_SEED = 42L;
    /**
     * How many customers to process before flushing and clearing the persistence context.
     * Without this, Hibernate's session keeps accumulating every managed entity across all
     * 300 customers, making each flush progressively slower (observed: seeding degraded from
     * ~80 orders/min to ~20 orders/min over a single run at this data scale).
     */
    private static final int FLUSH_EVERY_N_CUSTOMERS = 20;

    private static final List<String> PROVINCES = List.of("Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Cần Thơ", "Hải Phòng");
    private static final List<String> ORDER_STATUS_POOL =
            List.of("COMPLETED", "COMPLETED", "COMPLETED", "COMPLETED", "SHIPPING", "PROCESSING", "CANCELLED");

    private final CustomerRepository customerRepository;
    private final AccountRepository accountRepository;
    private final MembershipRepository membershipRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final OrderRepository orderRepository;
    private final CODPaymentMethodRepository codPaymentMethodRepository;
    private final FavoriteProductRepository favoriteProductRepository;
    private final PasswordEncoder passwordEncoder;
    private final EntityManager entityManager;

    private final Random random = new Random(RANDOM_SEED);

    @Override
    @Transactional
    public void run(String... args) {
        if (customerRepository.count() > 0) {
            log.info("[CustomerOrderSeeder] Customers already exist, skipping customer/order seed.");
            return;
        }

        Membership membership = ensureStandardMembership();
        CODPaymentMethod paymentMethod = codPaymentMethodRepository.findFirstByOrderByCreatedAtAsc()
                .orElseThrow(() -> new IllegalStateException(
                        "COD payment method chưa tồn tại — PaymentService phải khởi tạo trước CustomerOrderSeeder"));

        Map<String, List<Product>> productPoolByPersona = buildPersonaProductPools();
        List<Product> allProducts = productRepository.findAll();
        if (allProducts.isEmpty()) {
            log.warn("[CustomerOrderSeeder] No products found — run CatalogSeeder first. Skipping.");
            return;
        }

        // Fetch every variant once and group by product — avoids an N+1 query (one per order
        // item / favorite pick) which made seeding at this scale (150 products, thousands of
        // order items) impractically slow.
        List<String> allProductIds = allProducts.stream().map(Product::getId).toList();
        Map<String, List<ProductVariant>> variantsByProductId = productVariantRepository
                .findVariantsForProductIds(allProductIds).stream()
                .collect(Collectors.groupingBy(pv -> pv.getProduct().getId()));

        int customerCount = 0;
        int orderCount = 0;
        int orderItemCount = 0;
        int favoriteCount = 0;

        for (int i = 0; i < TOTAL_CUSTOMERS; i++) {
            Persona persona = pickPersona();
            Customer customer = createCustomer(i, persona, membership);
            customerCount++;

            List<Product> candidatePool = productPoolByPersona.getOrDefault(persona.key(), allProducts);
            favoriteCount += seedFavorites(customer, persona, candidatePool, allProducts, variantsByProductId);
            int orderCountForCustomer = pickOrderCount(persona);

            for (int j = 0; j < orderCountForCustomer; j++) {
                LocalDateTime orderDate = randomOrderDateWithinLastMonths(12);
                Order order = new Order(customer, customer.getAddresses().get(0), paymentMethod);
                order.setOrderDate(orderDate);

                int itemCount = 1 + random.nextInt(3);
                for (int k = 0; k < itemCount; k++) {
                    Product product = pickProduct(persona, candidatePool, allProducts);
                    List<ProductVariant> variants = variantsByProductId.getOrDefault(product.getId(), Collections.emptyList());
                    if (variants.isEmpty()) {
                        continue;
                    }
                    ProductVariant variant = variants.get(random.nextInt(variants.size()));
                    new OrderItem(order, variant, 1, variant.getPrice());
                    orderItemCount++;
                }
                if (order.getItems().isEmpty()) {
                    continue;
                }

                applyOrderStatus(order, orderDate);
                orderRepository.save(order);
                orderCount++;
            }

            if ((i + 1) % FLUSH_EVERY_N_CUSTOMERS == 0) {
                entityManager.flush();
                entityManager.clear();
            }
        }

        log.info("[CustomerOrderSeeder] Seeded {} customers, {} orders, {} order items, {} favorites.",
                customerCount, orderCount, orderItemCount, favoriteCount);
    }

    /**
     * Favorites are an extra implicit-feedback signal alongside orders: persona-driven like
     * purchases, but intentionally not required to overlap with what the customer actually
     * bought (browsing/wishlisting behavior differs from purchase behavior in real stores).
     */
    private int seedFavorites(Customer customer, Persona persona, List<Product> candidatePool, List<Product> allProducts,
            Map<String, List<ProductVariant>> variantsByProductId) {
        int favoriteTarget = random.nextInt(4); // 0-3 favorites per customer
        int seeded = 0;
        for (int i = 0; i < favoriteTarget; i++) {
            Product product = pickProduct(persona, candidatePool, allProducts);
            List<ProductVariant> variants = variantsByProductId.getOrDefault(product.getId(), Collections.emptyList());
            if (variants.isEmpty()) {
                continue;
            }
            ProductVariant variant = variants.get(random.nextInt(variants.size()));
            if (favoriteProductRepository.existsByCustomerIdAndProductVariantIdAndIsFavoriteTrue(
                    customer.getId(), variant.getId())) {
                continue;
            }
            favoriteProductRepository.save(new FavoriteProduct(variant, customer, SubscriptionStatus.SUBSCRIBED));
            seeded++;
        }
        return seeded;
    }

    private Membership ensureStandardMembership() {
        return membershipRepository.findByTier(MembershipTier.STANDARD)
                .orElseGet(() -> {
                    MembershipBenefit benefit = new MembershipBenefit(0.0, false, "Hạng thành viên mặc định.");
                    return membershipRepository.save(
                            new Membership(MembershipTier.STANDARD, benefit, BigDecimal.ZERO, null));
                });
    }

    /** For each persona, resolve its (category, brand) affinities to actual seeded Product entities. */
    private Map<String, List<Product>> buildPersonaProductPools() {
        List<Product> allProducts = productRepository.findAll();
        Map<String, List<Product>> pools = new HashMap<>();
        for (Persona persona : PersonaCatalog.all()) {
            List<Product> pool = new ArrayList<>();
            for (Product product : allProducts) {
                String categoryName = product.getCategory().getName();
                String brandName = product.getBrand().getName();
                boolean matches = persona.affinities().stream()
                        .anyMatch(a -> a.categoryName().equals(categoryName) && a.brandName().equals(brandName));
                if (matches) {
                    pool.add(product);
                }
            }
            pools.put(persona.key(), pool);
        }
        return pools;
    }

    private Persona pickPersona() {
        List<Persona> personas = PersonaCatalog.all();
        double totalWeight = personas.stream().mapToDouble(Persona::populationShare).sum();
        double roll = random.nextDouble() * totalWeight;
        double cumulative = 0;
        for (Persona persona : personas) {
            cumulative += persona.populationShare();
            if (roll <= cumulative) {
                return persona;
            }
        }
        return personas.get(personas.size() - 1);
    }

    private int pickOrderCount(Persona persona) {
        double jitter = 0.5 + random.nextDouble(); // 0.5x - 1.5x
        int count = (int) Math.round(BASE_ORDERS_PER_CUSTOMER * persona.orderFrequencyWeight() * jitter);
        return Math.max(1, count);
    }

    /** Weighted pick within the persona's affinities (with a chance of pure noise), then a product matching it. */
    private Product pickProduct(Persona persona, List<Product> candidatePool, List<Product> allProducts) {
        if (candidatePool.isEmpty() || random.nextDouble() < NOISE_PICK_PROBABILITY) {
            return allProducts.get(random.nextInt(allProducts.size()));
        }
        List<CategoryBrandAffinity> affinities = persona.affinities();
        double totalWeight = affinities.stream().mapToDouble(CategoryBrandAffinity::weight).sum();
        double roll = random.nextDouble() * totalWeight;
        double cumulative = 0;
        CategoryBrandAffinity chosen = affinities.get(affinities.size() - 1);
        for (CategoryBrandAffinity affinity : affinities) {
            cumulative += affinity.weight();
            if (roll <= cumulative) {
                chosen = affinity;
                break;
            }
        }
        final CategoryBrandAffinity finalChosen = chosen;
        List<Product> matches = candidatePool.stream()
                .filter(p -> p.getCategory().getName().equals(finalChosen.categoryName())
                        && p.getBrand().getName().equals(finalChosen.brandName()))
                .toList();
        if (matches.isEmpty()) {
            return candidatePool.get(random.nextInt(candidatePool.size()));
        }
        return matches.get(random.nextInt(matches.size()));
    }

    private void applyOrderStatus(Order order, LocalDateTime orderDate) {
        String status = ORDER_STATUS_POOL.get(random.nextInt(ORDER_STATUS_POOL.size()));
        OrderStatus orderStatus = OrderStatus.valueOf(status);
        order.setOrderStatus(orderStatus);
        if (orderStatus != OrderStatus.CANCELLED) {
            order.setPaidAt(orderDate.plusHours(2));
        }
    }

    private LocalDateTime randomOrderDateWithinLastMonths(int months) {
        long maxMinutesAgo = months * 30L * 24 * 60;
        long minutesAgo = (long) (random.nextDouble() * maxMinutesAgo);
        return LocalDateTime.now().minusMinutes(minutesAgo);
    }

    private Customer createCustomer(int index, Persona persona, Membership membership) {
        String fullName = "Khách hàng demo " + persona.displayName() + " #" + (index + 1);
        Customer customer = new Customer(fullName, randomPhone(), membership);
        customer.changeAddress(randomAddress());
        customerRepository.save(customer);

        Account account = new Account(
                "seed.customer." + (index + 1) + "@example.com",
                passwordEncoder.encode("Seed@12345"),
                customer,
                AccountStatus.ACTIVE);
        accountRepository.save(account);

        return customer;
    }

    private String randomPhone() {
        return "09" + String.format("%08d", random.nextInt(100_000_000));
    }

    private Address randomAddress() {
        String province = PROVINCES.get(random.nextInt(PROVINCES.size()));
        return new Address("Số " + (1 + random.nextInt(200)) + " đường ABC", "Phường " + (1 + random.nextInt(20)),
                "Quận " + (1 + random.nextInt(12)), province);
    }
}
