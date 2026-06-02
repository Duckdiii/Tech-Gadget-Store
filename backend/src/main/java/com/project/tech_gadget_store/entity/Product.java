package com.project.tech_gadget_store.entity;


import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import com.project.tech_gadget_store.entity.enums.ProductStatus;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Product extends BaseEntity {

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "price", nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private ProductStatus status = ProductStatus.AVAILABLE;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductImage> images = new ArrayList<>();

    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private PhoneSpecification spec;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductVariant> variants = new ArrayList<>();

    @ManyToMany(mappedBy = "products")
    private List<Promotion> promotions = new ArrayList<>();

    public Product(String name, String description, BigDecimal price, Brand brand, Category category) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.brand = brand;
        this.category = category;
        brand.getProducts().add(this);
        category.getProducts().add(this);
    }

    public void addVariant(ProductVariant variant) {
        Objects.requireNonNull(variant, "variant must not be null");
        if (variant.getProduct() != null && variant.getProduct() != this) {
            variant.getProduct().getVariants().remove(variant);
        }
        if (!variants.contains(variant)) {
            variants.add(variant);
        }
        variant.setProduct(this);
    }

    public void removeVariant(ProductVariant variant) {
        if (variant == null) {
            return;
        }
        if (variants.remove(variant)) {
            variant.setProduct(null);
        }
    }

    public void addImage(ProductImage image) {
        Objects.requireNonNull(image, "image must not be null");
        if (image.getProduct() != null && image.getProduct() != this) {
            image.getProduct().getImages().remove(image);
        }
        if (!images.contains(image)) {
            images.add(image);
        }
        image.setProduct(this);
    }

    public void removeImage(ProductImage image) {
        if (image == null) {
            return;
        }
        if (images.remove(image)) {
            image.setProduct(null);
        }
    }

    public void assignSpec(PhoneSpecification spec) {
        if (spec == null) {
            removeSpec();
            return;
        }
        if (this.spec == spec) {
            spec.setProduct(this);
            return;
        }
        removeSpec();
        if (spec.getProduct() != null && spec.getProduct() != this) {
            spec.getProduct().setSpec(null);
        }
        this.spec = spec;
        spec.setProduct(this);
    }

    public void removeSpec() {
        if (spec == null) {
            return;
        }
        PhoneSpecification currentSpec = spec;
        spec = null;
        currentSpec.setProduct(null);
    }

    public void changeBasicInfo(String name, String description, BigDecimal price) {
        this.name = Objects.requireNonNull(name, "name must not be null");
        this.description = description;
        this.price = Objects.requireNonNull(price, "price must not be null");
    }

    public void changeStatus(ProductStatus status) {
        this.status = Objects.requireNonNull(status, "status must not be null");
    }

    public boolean isAvailable() {
        return ProductStatus.AVAILABLE.equals(status);
    }

    public BigDecimal getMinVariantPrice() {
        return variants.stream()
                .map(ProductVariant::getPrice)
                .filter(Objects::nonNull)
                .min(Comparator.naturalOrder())
                .orElse(null);
    }

    public BigDecimal getMaxVariantPrice() {
        return variants.stream()
                .map(ProductVariant::getPrice)
                .filter(Objects::nonNull)
                .max(Comparator.naturalOrder())
                .orElse(null);
    }

    public boolean hasAvailableVariant() {
        return variants.stream()
                .anyMatch(variant -> ProductStatus.AVAILABLE.equals(variant.getStatus()));
    }
}
