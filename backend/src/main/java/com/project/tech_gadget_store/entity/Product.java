package com.project.tech_gadget_store.entity;

import com.project.tech_gadget_store.entity.enums.ProductStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
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
        if (name == null) {
            throw new IllegalArgumentException("name must not be null");
        }
        if (price == null) {
            throw new IllegalArgumentException("price must not be null");
        }
        if (brand == null) {
            throw new IllegalArgumentException("brand must not be null");
        }
        if (category == null) {
            throw new IllegalArgumentException("category must not be null");
        }
        this.name = name;
        this.description = description;
        this.price = price;
        this.brand = brand;
        this.category = category;
        brand.getProducts().add(this);
        category.getProducts().add(this);
    }

    public void addVariant(ProductVariant variant) {
        if (variant == null) {
            throw new IllegalArgumentException("variant must not be null");
        }
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
        if (image == null) {
            throw new IllegalArgumentException("image must not be null");
        }
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
        if (name == null) {
            throw new IllegalArgumentException("name must not be null");
        }
        if (price == null) {
            throw new IllegalArgumentException("price must not be null");
        }
        this.name = name;
        this.description = description;
        this.price = price;
    }

    public void changeStatus(ProductStatus status) {
        if (status == null) {
            throw new IllegalArgumentException("status must not be null");
        }
        this.status = status;
    }

    public boolean isAvailable() {
        return ProductStatus.AVAILABLE.equals(status);
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
                .anyMatch(variant -> variant.isAvailable() && variant.hasEnoughStock(1));
    }
}
