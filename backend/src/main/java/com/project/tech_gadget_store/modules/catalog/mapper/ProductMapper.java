package com.project.tech_gadget_store.modules.catalog.mapper;

import com.project.tech_gadget_store.modules.catalog.dto.response.FlashSaleProductResponseDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductDetailResponseDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductImageResponseDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductResponseDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductVariantResponseDto;
import com.project.tech_gadget_store.modules.catalog.entity.Headphones;
import com.project.tech_gadget_store.modules.catalog.entity.Laptop;
import com.project.tech_gadget_store.modules.catalog.entity.Monitor;
import com.project.tech_gadget_store.modules.catalog.entity.Phone;
import com.project.tech_gadget_store.modules.catalog.entity.Product;
import com.project.tech_gadget_store.modules.catalog.entity.ProductImage;
import com.project.tech_gadget_store.modules.catalog.entity.ProductVariant;
import com.project.tech_gadget_store.modules.catalog.entity.Smartwatch;
import com.project.tech_gadget_store.modules.loyalty.dto.response.BundleServiceResponseDto;
import com.project.tech_gadget_store.modules.loyalty.entity.BundleService;
import com.project.tech_gadget_store.modules.loyalty.entity.Promotion;
import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;



@Component
public class ProductMapper {

        public ProductResponseDto toProductResponseDto(Product product, List<ProductVariant> variants, Integer salesCount) {
                return toProductResponseDto(product, variants, salesCount, null, null, 0L);
        }

        public ProductResponseDto toProductResponseDto(Product product, List<ProductVariant> variants, Integer salesCount,
                        Double averageRating, Integer reviewCount) {
                return toProductResponseDto(product, variants, salesCount, averageRating, reviewCount, 0L);
        }

        public ProductResponseDto toProductResponseDto(Product product, List<ProductVariant> variants, Integer salesCount,
                        Double averageRating, Integer reviewCount, long availableCount) {
                ProductVariant first = variants.isEmpty() ? null : variants.get(0);

                BigDecimal minPrice = variants.stream()
                                .map(ProductVariant::getPrice)
                                .filter(Objects::nonNull)
                                .min(BigDecimal::compareTo)
                                .orElse(null);

                List<ProductImage> images = product.getImages();
                String imageUrl = images.isEmpty() ? null : images.get(0).getImageUrl();

                ProductResponseDto.ProductResponseDtoBuilder builder = ProductResponseDto.builder()
                                .id(product.getId())
                                .variantId(first != null ? first.getId() : null)
                                .name(product.getName())
                                .brandName(product.getBrand().getName())
                                .categoryName(product.getCategory().getName())
                                .minPrice(minPrice)
                                .imageUrl(imageUrl)
                                .ramGb(first != null ? first.getRamGb() : null)
                                .storageGb(first != null ? first.getStorageGb() : null)
                                .color(variants.stream()
                                                .map(ProductVariant::getColor)
                                                .filter(Objects::nonNull)
                                                .distinct()
                                                .collect(Collectors.joining(", ")))
                                .hasVariants(!variants.isEmpty())
                                .variantCount(variants.size())
                                .discountPercent(getBestActivePromotionPercent(product))
                                .salesCount(salesCount)
                                .specSummary(buildSpecSummary(product, variants))
                                .averageRating(averageRating)
                                .reviewCount(reviewCount)
                                .availableCount(availableCount);

                if (product instanceof Phone phone) {
                        builder.screenSize(phone.getScreenSize());
                        builder.chipset(phone.getChipset());
                        builder.batteryCapacity(phone.getBatteryCapacity());
                        builder.operatingSystem(phone.getOperatingSystem());
                        builder.resolution(phone.getScreenResolution());
                } else if (product instanceof Laptop laptop) {
                        builder.cpu(laptop.getCpu());
                        builder.gpu(laptop.getGpu());
                        builder.screenSize(laptop.getScreenSize());
                        builder.operatingSystem(laptop.getOperatingSystem());
                } else if (product instanceof Monitor monitor) {
                        builder.screenSize(monitor.getScreenSize());
                        builder.resolution(monitor.getResolution());
                        builder.refreshRate(monitor.getRefreshRate());
                        builder.panelType(monitor.getPanelType());
                } else if (product instanceof Headphones headphones) {
                        builder.isWireless(headphones.getIsWireless());
                        builder.hasNoiseCancelling(headphones.getHasNoiseCancelling());
                        builder.batteryLifeHours(headphones.getBatteryLifeHours());
                } else if (product instanceof Smartwatch smartwatch) {
                        builder.batteryLifeDays(smartwatch.getBatteryLifeDays());
                        builder.isWaterResistant(smartwatch.getIsWaterResistant());
                        builder.hasGps(smartwatch.getHasGps());
                }

                return builder.build();
        }

        public ProductDetailResponseDto toProductDetailResponseDto(Product product, List<ProductVariant> variants, List<BundleService> bundleServices, Integer salesCount) {
                List<String> imageUrls = product.getImages().stream()
                                .map(ProductImage::getImageUrl)
                                .toList();

                List<ProductVariant> productVariants = variants;

                BigDecimal minPrice = productVariants.stream()
                                .map(ProductVariant::getPrice)
                                .filter(Objects::nonNull)
                                .min(BigDecimal::compareTo)
                                .orElse(null);

                List<ProductVariantResponseDto> variantDtos = productVariants.stream()
                                .map(this::toVariantResponseDto)
                                .toList();

                List<ProductImageResponseDto> imageDtos = product.getImages().stream()
                                .map(img -> toImageResponseDto(img, product.getId()))
                                .toList();

                List<BundleServiceResponseDto> bundleServiceDtos = bundleServices.stream()
                                .map(bs -> BundleServiceResponseDto.builder()
                                                .id(bs.getId())
                                                .createdAt(bs.getCreatedAt())
                                                .updatedAt(bs.getUpdatedAt())
                                                .name(bs.getName())
                                                .type(bs.getType())
                                                .description(bs.getDescription())
                                                .price(bs.getPrice())
                                                .durationMonths(bs.getDurationMonths())
                                                .active(bs.getActive())
                                                .build())
                                .toList();

                Double screenSize = null;
                String screenResolution = null;
                String rearCamera = null;
                String frontCamera = null;
                String chipset = null;
                Boolean nfcSupported = null;
                Integer batteryCapacity = null;
                String simType = null;
                String operatingSystem = null;
                String cpu = null;
                String gpu = null;
                Double weight = null;
                Integer refreshRate = null;
                String panelType = null;
                String connectorType = null;
                Boolean isWireless = null;
                Integer batteryLifeHours = null;
                Boolean hasNoiseCancelling = null;
                Integer batteryLifeDays = null;
                Boolean isWaterResistant = null;
                Boolean hasGps = null;

                if (product instanceof Phone phone) {
                        screenSize = phone.getScreenSize();
                        screenResolution = phone.getScreenResolution();
                        rearCamera = phone.getRearCamera();
                        frontCamera = phone.getFrontCamera();
                        chipset = phone.getChipset();
                        nfcSupported = phone.getNfcSupported();
                        batteryCapacity = phone.getBatteryCapacity();
                        simType = phone.getSimType();
                        operatingSystem = phone.getOperatingSystem();
                } else if (product instanceof Laptop laptop) {
                        screenSize = laptop.getScreenSize();
                        operatingSystem = laptop.getOperatingSystem();
                        cpu = laptop.getCpu();
                        gpu = laptop.getGpu();
                        weight = laptop.getWeight();
                } else if (product instanceof Monitor monitor) {
                        screenSize = monitor.getScreenSize();
                        screenResolution = monitor.getResolution();
                        refreshRate = monitor.getRefreshRate();
                        panelType = monitor.getPanelType();
                } else if (product instanceof Headphones headphones) {
                        connectorType = headphones.getConnectorType();
                        isWireless = headphones.getIsWireless();
                        batteryLifeHours = headphones.getBatteryLifeHours();
                        hasNoiseCancelling = headphones.getHasNoiseCancelling();
                } else if (product instanceof Smartwatch smartwatch) {
                        batteryLifeDays = smartwatch.getBatteryLifeDays();
                        isWaterResistant = smartwatch.getIsWaterResistant();
                        hasGps = smartwatch.getHasGps();
                }

                return ProductDetailResponseDto.builder()
                                .id(product.getId())
                                .name(product.getName())
                                .description(product.getDescription())
                                .brandId(product.getBrand().getId())
                                .brandName(product.getBrand().getName())
                                .brandLogoUrl(product.getBrand().getLogoUrl())
                                .categoryId(product.getCategory().getId())
                                .categoryName(product.getCategory().getName())
                                .minPrice(minPrice)
                                .hasVariants(!productVariants.isEmpty())
                                .isActive(product.getIsActive())
                                .imageUrls(imageUrls)
                                .images(imageDtos)
                                .variants(variantDtos)
                                .bundleServices(bundleServiceDtos)
                                .screenSize(screenSize)
                                .screenResolution(screenResolution)
                                .rearCamera(rearCamera)
                                .frontCamera(frontCamera)
                                .chipset(chipset)
                                .nfcSupported(nfcSupported)
                                .batteryCapacity(batteryCapacity)
                                .simType(simType)
                                .operatingSystem(operatingSystem)
                                .cpu(cpu)
                                .gpu(gpu)
                                .weight(weight)
                                .refreshRate(refreshRate)
                                .panelType(panelType)
                                .connectorType(connectorType)
                                .isWireless(isWireless)
                                .batteryLifeHours(batteryLifeHours)
                                .hasNoiseCancelling(hasNoiseCancelling)
                                .batteryLifeDays(batteryLifeDays)
                                .isWaterResistant(isWaterResistant)
                                .hasGps(hasGps)
                                .discountPercent(getBestActivePromotionPercent(product))
                                .salesCount(salesCount)
                                .build();
        }

        public FlashSaleProductResponseDto toFlashSaleProductResponseDto(
                        Product product,
                        Promotion promotion,
                        ProductVariant variant) {
                List<ProductImage> images = product.getImages();
                String imageUrl = images.isEmpty() ? null : images.get(0).getImageUrl();

                BigDecimal originalPrice = variant != null ? variant.getPrice() : null;
                BigDecimal discountAmount = originalPrice != null ? promotion.calculateDiscount(originalPrice) : null;
                BigDecimal salePrice = originalPrice != null
                                ? originalPrice.subtract(discountAmount).max(BigDecimal.ZERO)
                                : null;

                return FlashSaleProductResponseDto.builder()
                                .id(product.getId())
                                .name(product.getName())
                                .brandName(product.getBrand().getName())
                                .imageUrl(imageUrl)
                                .variantId(variant != null ? variant.getId() : null)
                                .ramGb(variant != null ? variant.getRamGb() : null)
                                .storageGb(variant != null ? variant.getStorageGb() : null)
                                .color(variant != null ? variant.getColor() : null)
                                .originalPrice(originalPrice)
                                .discountAmount(discountAmount)
                                .salePrice(salePrice)
                                .discountPercent(promotion.getDiscountPercent())
                                .promotionId(promotion.getId())
                                .promotionCode(promotion.getCode())
                                .promotionName(promotion.getName())
                                .saleStartAt(promotion.getStartAt())
                                .saleEndAt(promotion.getEndAt())
                                .build();
        }

        public ProductVariantResponseDto toVariantResponseDto(ProductVariant variant) {
                return ProductVariantResponseDto.builder()
                                .id(variant.getId())
                                .createdAt(variant.getCreatedAt())
                                .updatedAt(variant.getUpdatedAt())
                                .productId(variant.getProduct().getId())
                                .ramGb(variant.getRamGb())
                                .storageGb(variant.getStorageGb())
                                .color(variant.getColor())
                                .price(variant.getPrice())
                                .build();
        }

        public ProductImageResponseDto toImageResponseDto(ProductImage image, String productId) {
                return ProductImageResponseDto.builder()
                                .id(image.getId())
                                .createdAt(image.getCreatedAt())
                                .updatedAt(image.getUpdatedAt())
                                .name(image.getName())
                                .imageUrl(image.getImageUrl())
                                .productId(productId)
                                .build();
        }

        private Double getBestActivePromotionPercent(Product product) {
                if (product.getPromotions() == null || product.getPromotions().isEmpty()) {
                        return null;
                }
                java.time.LocalDateTime now = java.time.LocalDateTime.now();
                return product.getPromotions().stream()
                                .filter(p -> Boolean.TRUE.equals(p.getActive()))
                                .filter(p -> p.getDiscountPercent() != null)
                                .filter(p -> !p.getStartAt().isAfter(now))
                                .filter(p -> !p.getEndAt().isBefore(now))
                                .max(java.util.Comparator.comparing(Promotion::getDiscountPercent))
                                .map(Promotion::getDiscountPercent)
                                .orElse(null);
        }

        /**
         * Builds a short spec summary string displayed in product card thumbnails.
         * Tailored per product type so the storefront never needs to know the concrete subtype.
         */
        private String buildSpecSummary(Product product, List<ProductVariant> variants) {
                List<String> parts = new java.util.ArrayList<>();
                if (product instanceof Phone phone) {
                        // RAM · Storage · Colors
                        if (!variants.isEmpty() && variants.get(0).getRamGb() != null)
                                parts.add("RAM " + variants.get(0).getRamGb() + "GB");
                        if (!variants.isEmpty() && variants.get(0).getStorageGb() != null)
                                parts.add(variants.get(0).getStorageGb() + "GB");
                        String colors = variants.stream()
                                        .map(ProductVariant::getColor)
                                        .filter(Objects::nonNull)
                                        .distinct()
                                        .collect(Collectors.joining(", "));
                        if (!colors.isBlank()) parts.add(colors);
                } else if (product instanceof Laptop laptop) {
                        if (laptop.getCpu() != null) parts.add(laptop.getCpu());
                        if (!variants.isEmpty() && variants.get(0).getRamGb() != null)
                                parts.add("RAM " + variants.get(0).getRamGb() + "GB");
                        if (!variants.isEmpty() && variants.get(0).getStorageGb() != null)
                                parts.add(variants.get(0).getStorageGb() + "GB");
                } else if (product instanceof Monitor monitor) {
                        if (monitor.getScreenSize() != null)
                                parts.add(monitor.getScreenSize().intValue() + "\"" );
                        if (monitor.getResolution() != null) parts.add(monitor.getResolution());
                        if (monitor.getRefreshRate() != null) parts.add(monitor.getRefreshRate() + "Hz");
                        if (monitor.getPanelType() != null) parts.add(monitor.getPanelType());
                } else if (product instanceof Headphones headphones) {
                        parts.add(Boolean.TRUE.equals(headphones.getIsWireless()) ? "Không dây" : "Có dây");
                        if (Boolean.TRUE.equals(headphones.getHasNoiseCancelling())) parts.add("Chống ồn ANC");
                        if (headphones.getBatteryLifeHours() != null)
                                parts.add(headphones.getBatteryLifeHours() + "h pin");
                } else if (product instanceof Smartwatch smartwatch) {
                        if (Boolean.TRUE.equals(smartwatch.getHasGps())) parts.add("GPS");
                        if (Boolean.TRUE.equals(smartwatch.getIsWaterResistant())) parts.add("Chống nước");
                        if (smartwatch.getBatteryLifeDays() != null)
                                parts.add(smartwatch.getBatteryLifeDays() + " ngày pin");
                } else {
                        // Generic fallback: RAM · Storage · Colors
                        if (!variants.isEmpty() && variants.get(0).getRamGb() != null)
                                parts.add("RAM " + variants.get(0).getRamGb() + "GB");
                        if (!variants.isEmpty() && variants.get(0).getStorageGb() != null)
                                parts.add(variants.get(0).getStorageGb() + "GB");
                }
                return parts.isEmpty() ? null : String.join(" · ", parts);
        }
}
