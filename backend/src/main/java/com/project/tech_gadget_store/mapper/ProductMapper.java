package com.project.tech_gadget_store.mapper;

import com.project.tech_gadget_store.dto.response.FlashSaleProductResponseDto;
import com.project.tech_gadget_store.dto.response.ProductResponseDto;
import com.project.tech_gadget_store.entity.Product;
import com.project.tech_gadget_store.entity.ProductImage;
import com.project.tech_gadget_store.entity.ProductVariant;
import com.project.tech_gadget_store.entity.Promotion;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

@Component
public class ProductMapper {

        public ProductResponseDto toProductResponseDto(Product product) {
                List<ProductVariant> variants = product.getVariants();
                ProductVariant first = variants.isEmpty() ? null : variants.get(0);

                BigDecimal minPrice = variants.stream()
                                .map(ProductVariant::getPrice)
                                .filter(Objects::nonNull)
                                .min(BigDecimal::compareTo)
                                .orElse(null);

                List<ProductImage> images = product.getImages();
                String imageUrl = images.isEmpty() ? null : images.get(0).getImageUrl();

                return ProductResponseDto.builder()
                                .id(product.getId())
                                .name(product.getName())
                                .brandName(product.getBrand().getName())
                                .minPrice(minPrice)
                                .imageUrl(imageUrl)
                                .ramGb(first != null ? first.getRamGb() : null)
                                .storageGb(first != null ? first.getStorageGb() : null)
                                .color(first != null ? first.getColor() : null)
                                .hasVariants(!variants.isEmpty())
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
}
