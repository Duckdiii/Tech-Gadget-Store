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

    public boolean isActiveProduct() {
        return Boolean.TRUE.equals(isActive);
    }

    public boolean hasNameIgnoreCase(String candidateName) {
        return StringUtils.hasText(name)
                && StringUtils.hasText(candidateName)
                && name.equalsIgnoreCase(candidateName);
    }

    public static Product createNew(Product source) {
        OffsetDateTime now = OffsetDateTime.now();
        return Product.builder()
                .id(UUID.randomUUID())
                .categoryId(source.getCategoryId())
                .brandId(source.getBrandId())
                .name(source.getName())
                .description(source.getDescription())
                .isActive(source.getIsActive())
                .createdAt(now)
                .updatedAt(now)
                .build();
    }

    public void applyUpdate(Product source) {
        this.name = source.getName();
        this.categoryId = source.getCategoryId();
        this.brandId = source.getBrandId();
        this.description = source.getDescription();
        this.isActive = source.getIsActive();
        this.updatedAt = OffsetDateTime.now();
    }
}
