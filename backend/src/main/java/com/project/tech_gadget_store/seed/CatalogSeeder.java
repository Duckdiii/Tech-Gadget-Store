package com.project.tech_gadget_store.seed;

import com.project.tech_gadget_store.modules.catalog.entity.Brand;
import com.project.tech_gadget_store.modules.catalog.entity.Category;
import com.project.tech_gadget_store.modules.catalog.entity.Product;
import com.project.tech_gadget_store.modules.catalog.entity.ProductFactory;
import com.project.tech_gadget_store.modules.catalog.entity.ProductVariant;
import com.project.tech_gadget_store.modules.catalog.repository.BrandRepository;
import com.project.tech_gadget_store.modules.catalog.repository.CategoryRepository;
import com.project.tech_gadget_store.modules.catalog.repository.ProductRepository;
import com.project.tech_gadget_store.modules.catalog.repository.ProductVariantRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Seeds Category/Brand/Product/ProductVariant with a realistic,
 * persona-friendly catalog
 * for local development and recommendation-system experimentation. Only runs
 * under the
 * "seed" profile so it can never fire against a real environment by accident.
 */
@Component
@Profile("seed")
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class CatalogSeeder implements CommandLineRunner {

        private final CategoryRepository categoryRepository;
        private final BrandRepository brandRepository;
        private final ProductRepository productRepository;
        private final ProductVariantRepository productVariantRepository;

        private record BrandSpec(String key, String name, String logoUrl, String description) {
        }

        private record VariantSpec(Integer ramGb, Integer storageGb, String color, BigDecimal price) {
        }

        private record ProductSpec(String name, String description, String brandKey, List<VariantSpec> variants) {
        }

        private record CategorySpec(String name, String imageUrl, List<ProductSpec> products) {
        }

        @Override
        @Transactional
        public void run(String... args) {
                if (categoryRepository.count() > 0) {
                        log.info("[CatalogSeeder] Categories already exist, skipping catalog seed.");
                        return;
                }

                Map<String, Brand> brands = new HashMap<>();
                for (BrandSpec spec : brandSpecs()) {
                        brands.put(spec.key(), brandRepository
                                        .save(new Brand(spec.name(), spec.logoUrl(), spec.description())));
                }

                int productCount = 0;
                int variantCount = 0;
                for (CategorySpec categorySpec : categorySpecs()) {
                        Category category = categoryRepository
                                        .save(new Category(categorySpec.name(), categorySpec.imageUrl()));
                        for (ProductSpec productSpec : categorySpec.products()) {
                                Brand brand = brands.get(productSpec.brandKey());
                                Product product = ProductFactory.createProduct(category, productSpec.name(),
                                                productSpec.description(), brand);
                                productRepository.save(product);
                                productCount++;
                                for (VariantSpec variantSpec : productSpec.variants()) {
                                        productVariantRepository.save(new ProductVariant(
                                                        product, variantSpec.ramGb(), variantSpec.storageGb(),
                                                        variantSpec.color(), variantSpec.price()));
                                        variantCount++;
                                }
                        }
                }

                log.info("[CatalogSeeder] Seeded {} categories, {} brands, {} products, {} variants.",
                                categorySpecs().size(), brands.size(), productCount, variantCount);
        }

        private List<BrandSpec> brandSpecs() {
                String logo = "https://placehold.co/200x200?text=Logo";
                return List.of(
                                new BrandSpec("apple", "Apple", logo,
                                                "Thương hiệu công nghệ cao cấp của Mỹ, hệ sinh thái khép kín."),
                                new BrandSpec("samsung", "Samsung", logo,
                                                "Thương hiệu Hàn Quốc, mạnh về Android flagship và thiết bị đeo."),
                                new BrandSpec("xiaomi", "Xiaomi", logo,
                                                "Thương hiệu Trung Quốc, nổi bật với sản phẩm giá tốt."),
                                new BrandSpec("dell", "Dell", logo,
                                                "Thương hiệu Mỹ chuyên laptop văn phòng và màn hình chuyên nghiệp."),
                                new BrandSpec("asus", "Asus", logo,
                                                "Thương hiệu Đài Loan mạnh về laptop gaming và màn hình."),
                                new BrandSpec("lenovo", "Lenovo", logo,
                                                "Thương hiệu laptop doanh nghiệp/văn phòng phổ biến."),
                                new BrandSpec("lg", "LG", logo,
                                                "Thương hiệu Hàn Quốc chuyên màn hình và thiết bị hiển thị."),
                                new BrandSpec("sony", "Sony", logo, "Thương hiệu Nhật Bản chuyên âm thanh cao cấp."),
                                new BrandSpec("jbl", "JBL", logo, "Thương hiệu âm thanh phổ thông, giá tốt."));
        }

        private static final long CATALOG_RANDOM_SEED = 20240601L;

        private static final List<String> COLORS = List.of("Đen", "Trắng", "Xanh", "Bạc", "Xám", "Vàng", "Đỏ");

        private static final List<String> PHONE_LINE_WORDS = List.of(
                        "Nova", "Edge", "Prime", "Flex", "Neo", "Zenith", "Spark", "Vortex");
        private static final List<String> LAPTOP_LINE_WORDS = List.of(
                        "Book", "Studio", "Elite", "Forge", "Swift", "Core", "Pulse", "Vector");
        private static final List<String> MONITOR_LINE_WORDS = List.of(
                        "Vision", "Clarity", "Wave", "Frame", "Display", "View", "Canvas", "Prism");
        private static final List<String> HEADPHONE_LINE_WORDS = List.of(
                        "Sound", "Beat", "Echo", "Tune", "Bass", "Aura", "Resonance", "Drift");
        private static final List<String> WATCH_LINE_WORDS = List.of(
                        "Fit", "Move", "Track", "Sync", "Active", "Vital", "Flow", "Orbit");

        /**
         * Extra products per (category, brand), generated procedurally so the catalog is large
         * enough for MF to have real room to beat simple popularity-based recommendations
         * (a handful of hand-picked products per brand isn't enough signal at scale).
         */
        private List<ProductSpec> generateExtraProducts(
                        List<String> brandKeys, Map<String, String> brandDisplayNames, List<String> lineWords,
                        BigDecimal minPrice, BigDecimal maxPrice, boolean hasSpecs, int perBrand, Random random) {
                List<ProductSpec> extras = new ArrayList<>();
                for (String brandKey : brandKeys) {
                        String brandName = brandDisplayNames.get(brandKey);
                        for (int i = 1; i <= perBrand; i++) {
                                String lineWord = lineWords.get(random.nextInt(lineWords.size()));
                                String name = brandName + " " + lineWord + " " + i;
                                BigDecimal price = randomPrice(minPrice, maxPrice, random);
                                String color = COLORS.get(random.nextInt(COLORS.size()));
                                List<VariantSpec> variants = hasSpecs
                                                ? List.of(new VariantSpec(
                                                                List.of(6, 8, 12, 16, 32).get(random.nextInt(5)),
                                                                List.of(128, 256, 512, 1024).get(random.nextInt(4)),
                                                                color, price))
                                                : List.of(new VariantSpec(null, null, color, price));
                                extras.add(new ProductSpec(name,
                                                "Sản phẩm mở rộng danh mục, dùng để tăng độ đa dạng cho recommendation system.",
                                                brandKey, variants));
                        }
                }
                return extras;
        }

        private BigDecimal randomPrice(BigDecimal min, BigDecimal max, Random random) {
                double value = min.doubleValue() + random.nextDouble() * (max.doubleValue() - min.doubleValue());
                return BigDecimal.valueOf(Math.round(value / 10000.0) * 10000.0).setScale(0, RoundingMode.HALF_UP);
        }

        private List<ProductSpec> withExtras(List<ProductSpec> base, List<ProductSpec> extras) {
                return Stream.concat(base.stream(), extras.stream()).toList();
        }

        private List<CategorySpec> categorySpecs() {
                String img = "https://placehold.co/400x400?text=Product";
                Map<String, String> brandNames = brandSpecs().stream()
                                .collect(Collectors.toMap(BrandSpec::key, BrandSpec::name));
                Random random = new Random(CATALOG_RANDOM_SEED);
                return List.of(
                                new CategorySpec("Điện thoại", img, withExtras(List.of(
                                                new ProductSpec("iPhone 15", "Điện thoại flagship của Apple.", "apple",
                                                                List.of(
                                                                                new VariantSpec(6, 128, "Đen",
                                                                                                new BigDecimal("22990000")),
                                                                                new VariantSpec(6, 256, "Xanh",
                                                                                                new BigDecimal("25990000")))),
                                                new ProductSpec("iPhone 15 Pro Max",
                                                                "Flagship cao cấp nhất dòng iPhone 15.", "apple",
                                                                List.of(
                                                                                new VariantSpec(8, 256,
                                                                                                "Titan Tự Nhiên",
                                                                                                new BigDecimal("34990000")),
                                                                                new VariantSpec(8, 512, "Titan Xanh",
                                                                                                new BigDecimal("39990000")))),
                                                new ProductSpec("Samsung Galaxy S24", "Flagship Android của Samsung.",
                                                                "samsung", List.of(
                                                                                new VariantSpec(8, 128, "Đen",
                                                                                                new BigDecimal("21990000")),
                                                                                new VariantSpec(8, 256, "Tím",
                                                                                                new BigDecimal("24990000")))),
                                                new ProductSpec("Samsung Galaxy A55", "Điện thoại tầm trung phổ biến.",
                                                                "samsung", List.of(
                                                                                new VariantSpec(8, 128, "Xanh Navy",
                                                                                                new BigDecimal("9990000")),
                                                                                new VariantSpec(8, 256, "Vàng",
                                                                                                new BigDecimal("10990000")))),
                                                new ProductSpec("Xiaomi Redmi Note 13",
                                                                "Điện thoại giá tốt của Xiaomi.", "xiaomi", List.of(
                                                                                new VariantSpec(6, 128, "Đen",
                                                                                                new BigDecimal("4990000")),
                                                                                new VariantSpec(8, 256, "Xanh",
                                                                                                new BigDecimal("5990000")))),
                                                new ProductSpec("Xiaomi 14", "Flagship của Xiaomi.", "xiaomi", List.of(
                                                                new VariantSpec(12, 256, "Đen",
                                                                                new BigDecimal("18990000"))))),
                                                generateExtraProducts(List.of("apple", "samsung", "xiaomi"), brandNames,
                                                                PHONE_LINE_WORDS, new BigDecimal("4500000"),
                                                                new BigDecimal("40000000"), true, 8, random))),
                                new CategorySpec("Laptop", img, withExtras(List.of(
                                                new ProductSpec("MacBook Air M2", "Laptop mỏng nhẹ của Apple.", "apple",
                                                                List.of(
                                                                                new VariantSpec(8, 256, "Bạc",
                                                                                                new BigDecimal("27990000")),
                                                                                new VariantSpec(16, 512, "Xám",
                                                                                                new BigDecimal("35990000")))),
                                                new ProductSpec("MacBook Pro 14",
                                                                "Laptop hiệu năng cao cho sáng tạo nội dung.", "apple",
                                                                List.of(
                                                                                new VariantSpec(16, 512, "Xám",
                                                                                                new BigDecimal("52990000")),
                                                                                new VariantSpec(32, 1024, "Bạc",
                                                                                                new BigDecimal("69990000")))),
                                                new ProductSpec("Dell XPS 13", "Laptop văn phòng cao cấp.", "dell",
                                                                List.of(
                                                                                new VariantSpec(16, 512, "Bạc",
                                                                                                new BigDecimal("32990000")))),
                                                new ProductSpec("Dell Inspiron 15", "Laptop văn phòng phổ thông.",
                                                                "dell", List.of(
                                                                                new VariantSpec(8, 256, "Đen",
                                                                                                new BigDecimal("14990000")),
                                                                                new VariantSpec(16, 512, "Bạc",
                                                                                                new BigDecimal("17990000")))),
                                                new ProductSpec("Asus ROG Strix G16", "Laptop gaming hiệu năng mạnh.",
                                                                "asus", List.of(
                                                                                new VariantSpec(16, 512, "Đen",
                                                                                                new BigDecimal("33990000")),
                                                                                new VariantSpec(32, 1024, "Đen",
                                                                                                new BigDecimal("42990000")))),
                                                new ProductSpec("Asus Vivobook 15", "Laptop văn phòng giá tốt.", "asus",
                                                                List.of(
                                                                                new VariantSpec(8, 512, "Bạc",
                                                                                                new BigDecimal("13990000")))),
                                                new ProductSpec("Lenovo ThinkPad E14", "Laptop doanh nghiệp bền bỉ.",
                                                                "lenovo", List.of(
                                                                                new VariantSpec(16, 512, "Đen",
                                                                                                new BigDecimal("18990000")))),
                                                new ProductSpec("Lenovo IdeaPad Slim 5", "Laptop mỏng nhẹ tầm trung.",
                                                                "lenovo", List.of(
                                                                                new VariantSpec(8, 256, "Xám",
                                                                                                new BigDecimal("12990000"))))),
                                                generateExtraProducts(List.of("apple", "dell", "asus", "lenovo"), brandNames,
                                                                LAPTOP_LINE_WORDS, new BigDecimal("10000000"),
                                                                new BigDecimal("70000000"), true, 8, random))),
                                new CategorySpec("Màn hình", img, withExtras(List.of(
                                                new ProductSpec("Dell UltraSharp U2723QE", "Màn hình 4K chuyên đồ họa.",
                                                                "dell", List.of(
                                                                                new VariantSpec(null, null, "Đen",
                                                                                                new BigDecimal("15990000")))),
                                                new ProductSpec("Dell S2721H", "Màn hình văn phòng Full HD.", "dell",
                                                                List.of(
                                                                                new VariantSpec(null, null, "Đen",
                                                                                                new BigDecimal("3490000")))),
                                                new ProductSpec("Asus TUF Gaming VG27AQ", "Màn hình gaming 165Hz.",
                                                                "asus", List.of(
                                                                                new VariantSpec(null, null, "Đen",
                                                                                                new BigDecimal("8990000")))),
                                                new ProductSpec("Asus ProArt PA278QV",
                                                                "Màn hình chuẩn màu cho sáng tạo nội dung.", "asus",
                                                                List.of(
                                                                                new VariantSpec(null, null, "Đen",
                                                                                                new BigDecimal("9990000")))),
                                                new ProductSpec("LG 27GP850", "Màn hình gaming QHD 165Hz.", "lg",
                                                                List.of(
                                                                                new VariantSpec(null, null, "Đen",
                                                                                                new BigDecimal("9490000")))),
                                                new ProductSpec("LG 24MK430H", "Màn hình văn phòng phổ thông.", "lg",
                                                                List.of(
                                                                                new VariantSpec(null, null, "Đen",
                                                                                                new BigDecimal("2790000"))))),
                                                generateExtraProducts(List.of("dell", "asus", "lg"), brandNames,
                                                                MONITOR_LINE_WORDS, new BigDecimal("2500000"),
                                                                new BigDecimal("20000000"), false, 8, random))),
                                new CategorySpec("Tai nghe", img, withExtras(List.of(
                                                new ProductSpec("AirPods Pro 2", "Tai nghe chống ồn của Apple.",
                                                                "apple", List.of(
                                                                                new VariantSpec(null, null, "Trắng",
                                                                                                new BigDecimal("5990000")))),
                                                new ProductSpec("AirPods Max", "Tai nghe over-ear cao cấp của Apple.",
                                                                "apple", List.of(
                                                                                new VariantSpec(null, null, "Xám",
                                                                                                new BigDecimal("13990000")))),
                                                new ProductSpec("Sony WH-1000XM5", "Tai nghe chống ồn hàng đầu.",
                                                                "sony", List.of(
                                                                                new VariantSpec(null, null, "Đen",
                                                                                                new BigDecimal("8490000")))),
                                                new ProductSpec("Sony WF-1000XM4", "Tai nghe true wireless chống ồn.",
                                                                "sony", List.of(
                                                                                new VariantSpec(null, null, "Đen",
                                                                                                new BigDecimal("5490000")))),
                                                new ProductSpec("JBL Tune 760NC", "Tai nghe chống ồn giá tốt.", "jbl",
                                                                List.of(
                                                                                new VariantSpec(null, null, "Xanh",
                                                                                                new BigDecimal("1490000")))),
                                                new ProductSpec("JBL Live 660NC",
                                                                "Tai nghe over-ear chống ồn phổ thông.", "jbl", List.of(
                                                                                new VariantSpec(null, null, "Đen",
                                                                                                new BigDecimal("1990000"))))),
                                                generateExtraProducts(List.of("apple", "sony", "jbl"), brandNames,
                                                                HEADPHONE_LINE_WORDS, new BigDecimal("1000000"),
                                                                new BigDecimal("15000000"), false, 8, random))),
                                new CategorySpec("Đồng hồ thông minh", img, withExtras(List.of(
                                                new ProductSpec("Apple Watch Series 9", "Smartwatch cao cấp của Apple.",
                                                                "apple", List.of(
                                                                                new VariantSpec(null, null, "Đen",
                                                                                                new BigDecimal("10990000")))),
                                                new ProductSpec("Apple Watch SE", "Smartwatch phổ thông của Apple.",
                                                                "apple", List.of(
                                                                                new VariantSpec(null, null, "Bạc",
                                                                                                new BigDecimal("6990000")))),
                                                new ProductSpec("Samsung Galaxy Watch6", "Smartwatch Android phổ biến.",
                                                                "samsung", List.of(
                                                                                new VariantSpec(null, null, "Đen",
                                                                                                new BigDecimal("6490000")))),
                                                new ProductSpec("Samsung Galaxy Watch6 Classic",
                                                                "Smartwatch cao cấp của Samsung.", "samsung", List.of(
                                                                                new VariantSpec(null, null, "Bạc",
                                                                                                new BigDecimal("8990000"))))),
                                                generateExtraProducts(List.of("apple", "samsung"), brandNames,
                                                                WATCH_LINE_WORDS, new BigDecimal("3000000"),
                                                                new BigDecimal("12000000"), false, 8, random))));
        }
}
