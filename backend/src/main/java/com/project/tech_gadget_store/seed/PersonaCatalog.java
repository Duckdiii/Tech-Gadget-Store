package com.project.tech_gadget_store.seed;

import java.util.List;

/**
 * Defines customer purchase-behavior personas used to generate synthetic orders
 * with a
 * realistic latent structure (instead of uniform randomness), so a downstream
 * recommendation
 * model (collaborative filtering / matrix factorization) has real patterns to
 * learn from.
 *
 * Category and brand names here must match {@link CatalogSeeder}'s seeded
 * catalog exactly,
 * since affinities are resolved by name when generating orders.
 */
public final class PersonaCatalog {

        private PersonaCatalog() {
        }

        /** One (category, brand) preference for a persona, with a relative weight. */
        public record CategoryBrandAffinity(String categoryName, String brandName, double weight) {
        }

        public record Persona(
                        String key,
                        String displayName,
                        double populationShare, // trong tổng số customer giả, bao nhiêu % sẽ là persona này
                        double orderFrequencyWeight, // hệ số quyết định một customer thuộc persona đó có xu hướng đặt
                                                     // bao nhiêu đơn hàng, so với mức trung bình chung
                        List<CategoryBrandAffinity> affinities) { // là danh sách các cặp (category, brand) mà persona
                                                                  // đó có xu hướng ưa thích, kèm theo mức độ ưa thích
                                                                  // (weight)
        }

        public static List<Persona> all() {
                return List.of(
                                new Persona("apple_ecosystem", "Apple Ecosystem", 0.20, 1.2, List.of( // Mua nhiều hơn
                                                                                                      // trung bình 20%
                                                new CategoryBrandAffinity("Điện thoại", "Apple", 1.0),
                                                new CategoryBrandAffinity("Laptop", "Apple", 0.7),
                                                new CategoryBrandAffinity("Tai nghe", "Apple", 0.8),
                                                new CategoryBrandAffinity("Đồng hồ thông minh", "Apple", 0.9))),
                                new Persona("gamer", "Gamer", 0.15, 1.0, List.of(
                                                new CategoryBrandAffinity("Laptop", "Asus", 1.0),
                                                new CategoryBrandAffinity("Màn hình", "Asus", 0.9),
                                                new CategoryBrandAffinity("Tai nghe", "Sony", 0.4),
                                                new CategoryBrandAffinity("Tai nghe", "JBL", 0.3))),
                                new Persona("office_business", "Office / Business", 0.20, 0.8, List.of(
                                                new CategoryBrandAffinity("Laptop", "Dell", 0.6),
                                                new CategoryBrandAffinity("Laptop", "Lenovo", 0.6),
                                                new CategoryBrandAffinity("Màn hình", "Dell", 0.7),
                                                new CategoryBrandAffinity("Màn hình", "LG", 0.5))),
                                new Persona("budget_android", "Budget Android", 0.20, 0.6, List.of(
                                                new CategoryBrandAffinity("Điện thoại", "Xiaomi", 1.0),
                                                new CategoryBrandAffinity("Tai nghe", "JBL", 0.6))),
                                new Persona("android_flagship", "Android Flagship", 0.15, 1.0, List.of(
                                                new CategoryBrandAffinity("Điện thoại", "Samsung", 1.0),
                                                new CategoryBrandAffinity("Đồng hồ thông minh", "Samsung", 0.8),
                                                new CategoryBrandAffinity("Tai nghe", "Sony", 0.3))),
                                new Persona("content_creator", "Content Creator", 0.10, 1.3, List.of(
                                                new CategoryBrandAffinity("Laptop", "Apple", 0.5),
                                                new CategoryBrandAffinity("Laptop", "Dell", 0.4),
                                                new CategoryBrandAffinity("Màn hình", "Asus", 0.6),
                                                new CategoryBrandAffinity("Màn hình", "Dell", 0.6),
                                                new CategoryBrandAffinity("Tai nghe", "Sony", 0.4))));
        }
}
