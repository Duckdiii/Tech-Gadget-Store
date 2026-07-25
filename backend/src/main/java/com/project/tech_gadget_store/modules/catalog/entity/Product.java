package com.project.tech_gadget_store.modules.catalog.entity;

import com.project.tech_gadget_store.common.entity.BaseEntity;
import com.project.tech_gadget_store.modules.loyalty.entity.Promotion;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Formula;



@Entity
@Table(name = "products")
@Inheritance(strategy = InheritanceType.JOINED)
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

    @Setter(AccessLevel.NONE)
    @Column(name = "is_active", nullable = false, columnDefinition = "boolean not null default true")
    private Boolean isActive = true;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private List<ProductImage> images = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "product_promotions", joinColumns = @JoinColumn(name = "product_id"), inverseJoinColumns = @JoinColumn(name = "promotion_id"))
    private List<Promotion> promotions = new ArrayList<>();

public Product(String name, String description, Brand brand, Category category) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("name must not be blank");
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

    public void changeBasicInfo(String name, String description) {
        if (name == null) {
            throw new IllegalArgumentException("name must not be null");
        }
        this.name = name;
        this.description = description;
    }

    public void discontinue() {
        this.isActive = false;
    }

    public void reactivate() {
        this.isActive = true;
    }

    // -------------------------------------------------------------------------
    // Type-specific behavior — overridden per subtype (Phone/Laptop/Monitor/Headphones/
    // Smartwatch) so callers (ProductMapper, ProductManagementService, OrderService...) never
    // need to type-switch on `instanceof` to find out what kind of product this is.
    // -------------------------------------------------------------------------

    /** This product's type-specific spec fields; empty unless a subtype overrides it. */
    public ProductSpecs specs() {
        return ProductSpecs.EMPTY;
    }

    /** Copies whichever of {@code specs}' fields apply to this product's type onto itself; no-op unless overridden. */
    public void applySpecs(ProductSpecs specs) {
        // no type-specific fields on the base type
    }

    /** Short descriptive snippets ("RAM 8GB", "Snapdragon 8 Gen 3"...) for the storefront card summary. */
    public List<String> buildSpecSummaryParts(List<ProductVariant> variants) {
        List<String> parts = new ArrayList<>();
        appendRamAndStorage(parts, variants);
        return parts;
    }

    /** Shared by the base fallback and the {@link Phone}/{@link Laptop} overrides. */
    protected void appendRamAndStorage(List<String> parts, List<ProductVariant> variants) {
        if (!variants.isEmpty() && variants.get(0).getRamGb() != null) {
            parts.add("RAM " + variants.get(0).getRamGb() + "GB");
        }
        if (!variants.isEmpty() && variants.get(0).getStorageGb() != null) {
            parts.add(variants.get(0).getStorageGb() + "GB");
        }
    }

    /** Weight (kg) used for shipping-manifest calculations; overridden by {@link Laptop}. */
    public double shippingWeightKg() {
        return 0.5;
    }
}
