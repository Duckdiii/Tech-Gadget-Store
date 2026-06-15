package com.project.tech_gadget_store.service;

import com.project.tech_gadget_store.dto.response.ProductResponseDto;
import com.project.tech_gadget_store.entity.Product;
import com.project.tech_gadget_store.entity.ProductImage;
import com.project.tech_gadget_store.entity.ProductVariant;
import com.project.tech_gadget_store.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

@Service
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<ProductResponseDto> findAll() {
        return productRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    private ProductResponseDto toDto(Product p) {
        List<ProductVariant> variants = p.getVariants();
        ProductVariant first = variants.isEmpty() ? null : variants.get(0);

        BigDecimal minPrice = variants.stream()
                .map(ProductVariant::getPrice)
                .filter(Objects::nonNull)
                .min(BigDecimal::compareTo)
                .orElse(null);

        List<ProductImage> images = p.getImages();
        String imageUrl = images.isEmpty() ? null : images.get(0).getImageUrl();

        return ProductResponseDto.builder()
                .id(p.getId())
                .name(p.getName())
                .brandName(p.getBrand().getName())
                .minPrice(minPrice)
                .imageUrl(imageUrl)
                .ramGb(first != null ? first.getRamGb() : null)
                .storageGb(first != null ? first.getStorageGb() : null)
                .color(first != null ? first.getColor() : null)
                .hasVariants(!variants.isEmpty())
                .build();
    }
}
