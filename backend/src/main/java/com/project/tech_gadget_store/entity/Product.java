package com.project.tech_gadget_store.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "brand_id", nullable = false)
    private Brand brand;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private List<ProductImage> images = new ArrayList<>();

    @OneToOne(mappedBy = "product", fetch = FetchType.LAZY)
    private PhoneSpecification spec;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private List<ProductVariant> variants = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private List<Promotion> promotions = new ArrayList<>();

    @OneToMany(mappedBy = "product", fetch = FetchType.LAZY)
    private List<ProductSubscription> productSubscriptions = new ArrayList<>();

    public Product(String name, String description, Brand brand, Category category) {
        if (name == null) {
            throw new IllegalArgumentException("name must not be null");
        }
        if (brand == null) {
            throw new IllegalArgumentException("brand must not be null");
        }
        if (category == null) {
            throw new IllegalArgumentException("category must not be null");
        }
        this.name = name;
        this.description = description;
        brand.addProduct(this);
        category.addProduct(this);
    }

    public void addVariant(ProductVariant variant) {
        if (variant == null) {
            throw new IllegalArgumentException("variant must not be null");
        }
        if (!variants.contains(variant)) {
            variants.add(variant);
        }
    }

    public void removeVariant(ProductVariant variant) {
        variants.remove(variant);
    }

    public void addImage(ProductImage image) {
        if (image == null) {
            throw new IllegalArgumentException("image must not be null");
        }
        if (!images.contains(image)) {
            images.add(image);
        }
    }

    public void removeImage(ProductImage image) {
        images.remove(image);
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

    public void changeBasicInfo(String name, String description) {
        if (name == null) {
            throw new IllegalArgumentException("name must not be null");
        }
        this.name = name;
        this.description = description;
    }

    public BigDecimal getMinVariantPrice() {
        BigDecimal minPrice = null;
        for (ProductVariant variant : variants) {
            if (variant == null) {
                throw new IllegalStateException("product variant must not be null");
            }
            if (variant.getPrice() == null) {
                throw new IllegalStateException("product variant price must not be null");
            }
            if (minPrice == null || variant.getPrice().compareTo(minPrice) < 0) {
                minPrice = variant.getPrice();
            }
        }
        return minPrice;
    }

    public BigDecimal getMaxVariantPrice() {
        BigDecimal maxPrice = null;
        for (ProductVariant variant : variants) {
            if (variant == null) {
                throw new IllegalStateException("product variant must not be null");
            }
            if (variant.getPrice() == null) {
                throw new IllegalStateException("product variant price must not be null");
            }
            if (maxPrice == null || variant.getPrice().compareTo(maxPrice) > 0) {
                maxPrice = variant.getPrice();
            }
        }
        return maxPrice;
    }

    public boolean hasAvailableVariant() {
        return variants.stream()
                .anyMatch(variant -> variant.hasEnoughStock(1));
    }
}
