package com.project.tech_gadget_store.seed;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import java.util.Random;

/**
 * Builds a richer, multi-sentence product description from data already on hand (category,
 * brand, name, variant specs, price) instead of the one-line filler previously used by
 * {@link CatalogSeeder}. Shared by the seeder (fresh products) and {@link ProductDescriptionSeeder}
 * (topping up already-seeded rows) so both produce the same style of copy.
 *
 * Structure: [opening sentence — either a hand-written blurb passed in, or a random template
 * pick] + [spec sentence, only when RAM/storage data exists] + [closing sentence]. Random
 * selection is driven by the caller's {@link Random} so output is reproducible when seeded.
 */
final class ProductDescriptionGenerator {

    private ProductDescriptionGenerator() {
    }

    private record TemplatePool(List<String> openers, List<String> specTemplates, List<String> closers) {
    }

    private static final TemplatePool PHONE = new TemplatePool(
            List.of(
                    "{name} mang đến trải nghiệm di động mượt mà, đáp ứng tốt nhu cầu làm việc, giải trí và chụp ảnh hàng ngày.",
                    "{name} là lựa chọn đáng cân nhắc trong phân khúc {tier} nhờ sự cân bằng giữa thiết kế, hiệu năng và mức giá.",
                    "Đến từ {brand}, {name} sở hữu thiết kế hiện đại cùng hiệu năng ổn định cho nhu cầu sử dụng hàng ngày.",
                    "{name} tập trung vào trải nghiệm mượt mà và thời lượng pin bền bỉ, phù hợp cho người dùng thường xuyên di chuyển."),
            List.of(
                    "Máy được trang bị RAM {ram}GB cùng bộ nhớ trong {storage}GB{colorClause}, đủ sức xử lý đa nhiệm và lưu trữ dữ liệu thoải mái.",
                    "Cấu hình RAM {ram}GB, bộ nhớ {storage}GB{colorClause} giúp máy vận hành mượt mà kể cả khi mở nhiều ứng dụng cùng lúc."),
            List.of(
                    "Sản phẩm được bảo hành chính hãng 12 tháng, hỗ trợ đổi trả trong 30 ngày đầu nếu phát sinh lỗi kỹ thuật.",
                    "Đi kèm chính sách bảo hành và hỗ trợ kỹ thuật tận tâm từ TechStore, mang lại sự an tâm khi sử dụng lâu dài.",
                    "Đây là lựa chọn phù hợp cho những ai tìm kiếm một chiếc điện thoại bền bỉ, đáp ứng tốt nhu cầu sử dụng hàng ngày."));

    private static final TemplatePool LAPTOP = new TemplatePool(
            List.of(
                    "{name} đến từ {brand} phù hợp cho công việc văn phòng, học tập và các tác vụ đa nhiệm hàng ngày.",
                    "{name} là lựa chọn phù hợp trong phân khúc {tier}, cân bằng tốt giữa hiệu năng xử lý và tính di động.",
                    "Thiết kế mỏng nhẹ cùng hiệu năng ổn định giúp {name} trở thành người bạn đồng hành lý tưởng khi di chuyển.",
                    "{name} hướng đến nhóm người dùng cần một chiếc laptop bền bỉ, xử lý tốt các phần mềm văn phòng lẫn giải trí."),
            List.of(
                    "Máy trang bị RAM {ram}GB, ổ cứng {storage}GB{colorClause}, đảm bảo tốc độ khởi động nhanh và không gian lưu trữ rộng rãi.",
                    "Cấu hình RAM {ram}GB cùng dung lượng lưu trữ {storage}GB{colorClause} mang lại trải nghiệm mượt mà cho cả công việc lẫn giải trí."),
            List.of(
                    "Sản phẩm được bảo hành chính hãng 12 tháng, hỗ trợ kỹ thuật tận nơi trong suốt thời gian bảo hành.",
                    "Đi kèm dịch vụ hậu mãi chu đáo từ TechStore, giúp khách hàng an tâm sử dụng lâu dài.",
                    "Phù hợp cho sinh viên, nhân viên văn phòng hoặc bất kỳ ai cần một thiết bị làm việc đáng tin cậy mỗi ngày."));

    private static final TemplatePool MONITOR = new TemplatePool(
            List.of(
                    "{name} mang lại chất lượng hiển thị sắc nét, phù hợp cho công việc văn phòng, thiết kế hoặc giải trí đa phương tiện.",
                    "{name} đến từ {brand} là lựa chọn đáng chú ý trong phân khúc {tier} dành cho người dùng cần màn hình chất lượng cao.",
                    "Với độ phân giải sắc nét và màu sắc chân thực, {name} phù hợp cho cả công việc lẫn giải trí."),
            List.of(),
            List.of(
                    "Màn hình hỗ trợ nhiều cổng kết nối tiêu chuẩn, dễ dàng tương thích với laptop, PC hoặc máy chơi game.",
                    "Sản phẩm được bảo hành chính hãng 24 tháng, đảm bảo trải nghiệm sử dụng lâu dài không lo gián đoạn.",
                    "Thiết kế viền mỏng hiện đại giúp tối ưu không gian làm việc, phù hợp với nhiều bố trí bàn làm việc khác nhau."));

    private static final TemplatePool HEADPHONE = new TemplatePool(
            List.of(
                    "{name} mang đến chất lượng âm thanh sống động, phù hợp cho nghe nhạc, xem phim hoặc đàm thoại hàng ngày.",
                    "{name} đến từ {brand} là lựa chọn phù hợp trong phân khúc {tier} dành cho người yêu âm thanh.",
                    "Thiết kế thoải mái khi đeo trong thời gian dài giúp {name} phù hợp cho cả công việc lẫn giải trí."),
            List.of(),
            List.of(
                    "Sản phẩm đi kèm thời lượng pin bền bỉ, đáp ứng tốt nhu cầu sử dụng cả ngày dài.",
                    "Kết nối ổn định cùng chất lượng hoàn thiện cao mang lại trải nghiệm nghe nhạc đáng tin cậy.",
                    "Bảo hành chính hãng 12 tháng, hỗ trợ đổi trả trong 30 ngày nếu phát hiện lỗi từ nhà sản xuất."));

    private static final TemplatePool SMARTWATCH = new TemplatePool(
            List.of(
                    "{name} giúp theo dõi sức khỏe và vận động hàng ngày một cách tiện lợi ngay trên cổ tay.",
                    "{name} đến từ {brand} là lựa chọn phù hợp trong phân khúc {tier} dành cho người yêu thích lối sống năng động.",
                    "Thiết kế nhỏ gọn cùng nhiều tính năng thông minh giúp {name} trở thành trợ thủ đắc lực mỗi ngày."),
            List.of(),
            List.of(
                    "Sản phẩm hỗ trợ theo dõi nhịp tim, giấc ngủ và các bài tập thể thao phổ biến.",
                    "Thời lượng pin bền bỉ giúp người dùng sử dụng liên tục nhiều ngày mà không cần sạc thường xuyên.",
                    "Bảo hành chính hãng 12 tháng, đảm bảo an tâm trong suốt quá trình sử dụng."));

    private static TemplatePool poolFor(String categoryName) {
        String lower = categoryName == null ? "" : categoryName.toLowerCase();
        if (lower.contains("điện thoại") || lower.contains("phone")) return PHONE;
        if (lower.contains("laptop")) return LAPTOP;
        if (lower.contains("màn hình") || lower.contains("monitor")) return MONITOR;
        if (lower.contains("tai nghe") || lower.contains("headphone")) return HEADPHONE;
        if (lower.contains("đồng hồ") || lower.contains("smartwatch")) return SMARTWATCH;
        return PHONE;
    }

    /** Price brackets are per-category since "cao cấp" means something different for a monitor vs. a laptop. */
    private static String tierFor(String categoryName, BigDecimal price) {
        if (price == null) return "phổ thông";
        String lower = categoryName == null ? "" : categoryName.toLowerCase();
        double v = price.doubleValue();
        double midMax, highMin;
        if (lower.contains("laptop")) {
            midMax = 35_000_000;
            highMin = 35_000_000;
        } else if (lower.contains("điện thoại") || lower.contains("phone")) {
            midMax = 20_000_000;
            highMin = 20_000_000;
        } else if (lower.contains("màn hình") || lower.contains("monitor")) {
            midMax = 12_000_000;
            highMin = 12_000_000;
        } else if (lower.contains("đồng hồ") || lower.contains("smartwatch")) {
            midMax = 9_000_000;
            highMin = 9_000_000;
        } else {
            midMax = 6_000_000;
            highMin = 6_000_000;
        }
        if (v >= highMin) return "cao cấp";
        if (v >= midMax / 2) return "tầm trung";
        return "phổ thông";
    }

    /**
     * @param categoryName    e.g. "Điện thoại", "Laptop" — selects which template pool to use.
     * @param brandName       used in some opener templates.
     * @param productName     used in most templates.
     * @param openingBlurb    an existing hand-written first sentence to keep instead of picking a
     *                        random opener (pass {@code null}/blank to always pick one at random).
     * @param ramOptions      distinct RAM sizes across the product's variants; empty if not applicable.
     * @param storageOptions  distinct storage sizes across the product's variants; empty if not applicable.
     * @param colors          distinct colors across the product's variants; may be empty.
     * @param referencePrice  a representative price (e.g. the cheapest variant) for tier wording; nullable.
     * @param random          drives template selection; pass a seeded {@link Random} for reproducible output.
     */
    static String generate(
            String categoryName,
            String brandName,
            String productName,
            String openingBlurb,
            List<Integer> ramOptions,
            List<Integer> storageOptions,
            List<String> colors,
            BigDecimal referencePrice,
            Random random) {
        TemplatePool pool = poolFor(categoryName);
        String tier = tierFor(categoryName, referencePrice);

        String opener = (openingBlurb != null && !openingBlurb.isBlank())
                ? openingBlurb.strip()
                : fill(pool.openers().get(random.nextInt(pool.openers().size())), productName, brandName, tier, null, null, null);

        StringBuilder sb = new StringBuilder(opener);

        boolean hasSpecs = !ramOptions.isEmpty() && !storageOptions.isEmpty()
                && ramOptions.get(0) != null && storageOptions.get(0) != null && !pool.specTemplates().isEmpty();
        if (hasSpecs) {
            String colorClause = colors.isEmpty() ? "" : ", màu " + String.join(", ", colors);
            String specSentence = fill(
                    pool.specTemplates().get(random.nextInt(pool.specTemplates().size())),
                    productName, brandName, tier, ramOptions.get(0), storageOptions.get(0), colorClause);
            sb.append(' ').append(specSentence);
        }

        sb.append(' ').append(pool.closers().get(random.nextInt(pool.closers().size())));
        return sb.toString();
    }

    private static String fill(String template, String name, String brand, String tier,
            Integer ram, Integer storage, String colorClause) {
        String result = template
                .replace("{name}", Objects.requireNonNullElse(name, ""))
                .replace("{brand}", Objects.requireNonNullElse(brand, ""))
                .replace("{tier}", tier);
        if (ram != null) result = result.replace("{ram}", String.valueOf(ram));
        if (storage != null) result = result.replace("{storage}", String.valueOf(storage));
        if (colorClause != null) result = result.replace("{colorClause}", colorClause);
        return result;
    }
}
