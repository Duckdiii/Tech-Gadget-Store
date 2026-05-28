package com.project.tech_gadget_store.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.util.StringUtils;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("products")
public class Product {
    @Id
    private UUID id;
    @Column("category_id")
    private UUID categoryId;
    @Column("brand_id")
    private UUID brandId;
    private String name;
    private String description;
    @Column("is_active")
    private Boolean isActive;
    @Column("created_at")
    private OffsetDateTime createdAt;
    @Column("updated_at")
    private OffsetDateTime updatedAt;

    public static void validateProductId(UUID productId) {
        if (productId == null) {
            throw new IllegalArgumentException("Product ID cannot be null");
        }
    }

    public static String normalizeName(String name) {
        if (!StringUtils.hasText(name)) {
            throw new IllegalArgumentException("Product name cannot be blank");
        }
        return name.trim();
    }

    public static String normalizeDescription(String description) {
        return StringUtils.hasText(description) ? description.trim() : null;
    }

    public static void validateForCreate(Product source) {
        if (source == null) {
            throw new IllegalArgumentException("Product cannot be null");
        }
        if (source.getCategoryId() == null) {
            throw new IllegalArgumentException("Category ID cannot be null");
        }
        if (source.getBrandId() == null) {
            throw new IllegalArgumentException("Brand ID cannot be null");
        }
        normalizeName(source.getName());
    }

    public boolean isActiveProduct() {
        return Boolean.TRUE.equals(isActive);
    }

    public boolean hasNameIgnoreCase(String candidateName) {
        return StringUtils.hasText(name)
                && StringUtils.hasText(candidateName)
                && normalizeName(name).equalsIgnoreCase(normalizeName(candidateName));
    }

    public static Product createNew(Product source) {
        validateForCreate(source);
        OffsetDateTime now = OffsetDateTime.now();
        return Product.builder()
                .id(UUID.randomUUID())
                .categoryId(source.getCategoryId())
                .brandId(source.getBrandId())
                .name(normalizeName(source.getName()))
                .description(normalizeDescription(source.getDescription()))
                .isActive(source.getIsActive() != null ? source.getIsActive() : Boolean.TRUE)
                .createdAt(now)
                .updatedAt(now)
                .build();
    }

    public void applyUpdate(Product source) {
        validateForCreate(source);
        this.name = normalizeName(source.getName());
        this.categoryId = source.getCategoryId();
        this.brandId = source.getBrandId();
        this.description = normalizeDescription(source.getDescription());
        this.isActive = source.getIsActive() != null ? source.getIsActive() : this.isActive;
        this.updatedAt = OffsetDateTime.now();
    }
}
