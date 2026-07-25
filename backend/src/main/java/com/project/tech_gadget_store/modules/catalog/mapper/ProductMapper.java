package com.project.tech_gadget_store.modules.catalog.mapper;

import com.project.tech_gadget_store.modules.catalog.dto.response.FlashSaleProductResponseDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductDetailResponseDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductImageResponseDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductResponseDto;
import com.project.tech_gadget_store.modules.catalog.dto.response.ProductVariantResponseDto;
import com.project.tech_gadget_store.modules.catalog.entity.Product;
import com.project.tech_gadget_store.modules.catalog.entity.ProductImage;
import com.project.tech_gadget_store.modules.catalog.entity.ProductSpecs;
import com.project.tech_gadget_store.modules.catalog.entity.ProductVariant;
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

                ProductSpecs specs = product.specs();
                builder.screenSize(specs.getScreenSize());
                builder.resolution(specs.getScreenResolution());
                builder.chipset(specs.getChipset());
                builder.batteryCapacity(specs.getBatteryCapacity());
                builder.operatingSystem(specs.getOperatingSystem());
                builder.cpu(specs.getCpu());
                builder.gpu(specs.getGpu());
                builder.refreshRate(specs.getRefreshRate());
                builder.panelType(specs.getPanelType());
                builder.isWireless(specs.getIsWireless());
                builder.hasNoiseCancelling(specs.getHasNoiseCancelling());
                builder.batteryLifeHours(specs.getBatteryLifeHours());
                builder.batteryLifeDays(specs.getBatteryLifeDays());
                builder.isWaterResistant(specs.getIsWaterResistant());
                builder.hasGps(specs.getHasGps());

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

                ProductSpecs specs = product.specs();

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
                                .screenSize(specs.getScreenSize())
                                .screenResolution(specs.getScreenResolution())
                                .rearCamera(specs.getRearCamera())
                                .frontCamera(specs.getFrontCamera())
                                .chipset(specs.getChipset())
                                .nfcSupported(specs.getNfcSupported())
                                .batteryCapacity(specs.getBatteryCapacity())
                                .simType(specs.getSimType())
                                .operatingSystem(specs.getOperatingSystem())
                                .cpu(specs.getCpu())
                                .gpu(specs.getGpu())
                                .weight(specs.getWeight())
                                .refreshRate(specs.getRefreshRate())
                                .panelType(specs.getPanelType())
                                .connectorType(specs.getConnectorType())
                                .isWireless(specs.getIsWireless())
                                .batteryLifeHours(specs.getBatteryLifeHours())
                                .hasNoiseCancelling(specs.getHasNoiseCancelling())
                                .batteryLifeDays(specs.getBatteryLifeDays())
                                .isWaterResistant(specs.getIsWaterResistant())
                                .hasGps(specs.getHasGps())
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
         * Tailored per product type — delegates to {@link Product#buildSpecSummaryParts} so the
         * mapper never needs to know the concrete subtype.
         */
        private String buildSpecSummary(Product product, List<ProductVariant> variants) {
                List<String> parts = product.buildSpecSummaryParts(variants);
                return parts.isEmpty() ? null : String.join(" · ", parts);
        }
}
