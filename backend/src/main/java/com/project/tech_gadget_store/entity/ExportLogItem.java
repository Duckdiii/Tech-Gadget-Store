package com.project.tech_gadget_store.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "export_log_items")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ExportLogItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_variant_id", nullable = false)
    private ProductVariant productVariant;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    public ExportLogItem(ExportLog exportLog, ProductVariant productVariant, Integer quantity) {
        if (exportLog == null) {
            throw new IllegalArgumentException("exportLog must not be null");
        }
        if (productVariant == null) {
            throw new IllegalArgumentException("productVariant must not be null");
        }
        if (quantity == null) {
            throw new IllegalArgumentException("quantity must not be null");
        }
        this.productVariant = productVariant;
        this.quantity = quantity;
        exportLog.addItem(this);
    }

    public void changeQuantity(int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("quantity must be positive");
        }
        this.quantity = quantity;
    }

}
