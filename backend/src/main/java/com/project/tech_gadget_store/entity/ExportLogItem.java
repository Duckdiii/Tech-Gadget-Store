package com.project.tech_gadget_store.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

    @Column(name = "product_variant_id", nullable = false, length = 36)
    private String productVariantId;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    public ExportLogItem(ExportLog exportLog, String productVariantId, Integer quantity) {
        if (exportLog == null) {
            throw new IllegalArgumentException("exportLog must not be null");
        }
        if (productVariantId == null || productVariantId.isBlank()) {
            throw new IllegalArgumentException("productVariantId must not be blank");
        }
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("quantity must be positive");
        }
        this.productVariantId = productVariantId;
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
