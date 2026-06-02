package com.project.tech_gadget_store.entity;


import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import com.project.tech_gadget_store.entity.enums.ProductStatus;
import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(
        name = "product_variants",
        uniqueConstraints = @UniqueConstraint(name = "uk_product_variants_sku", columnNames = "sku")
)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProductVariant extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "ram_gb")
    private Integer ramGb;

    @Column(name = "storage_gb")
    private Integer storageGb;

    @Column(name = "color", length = 80)
    private String color;

    @Column(name = "price", precision = 15, scale = 2)
    private BigDecimal price;

    @Column(name = "sku", nullable = false, length = 80)
    private String sku;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private ProductStatus status = ProductStatus.AVAILABLE;

    @OneToOne(mappedBy = "productVariant", fetch = FetchType.LAZY)
    private Inventory inventory;

    public ProductVariant(Product product, Integer ramGb, Integer storageGb, String color, BigDecimal price, String sku) {
        this.product = product;
        this.ramGb = ramGb;
        this.storageGb = storageGb;
        this.color = color;
        this.price = price;
        this.sku = sku;
        product.getVariants().add(this);
    }

    public void assignInventory(Inventory inventory) {
        this.inventory = inventory;
        inventory.setProductVariant(this);
    }
}
