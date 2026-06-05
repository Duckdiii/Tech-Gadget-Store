package com.project.tech_gadget_store.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "import_log_items")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ImportLogItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_variant_id", nullable = false)
    private ProductVariant productVariant;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "import_price", nullable = false)
    private BigDecimal importPrice;

    public ImportLogItem(ImportLog importLog, ProductVariant productVariant, Integer quantity, BigDecimal importPrice) {
        if (importLog == null) {
            throw new IllegalArgumentException("importLog must not be null");
        }
        if (productVariant == null) {
            throw new IllegalArgumentException("productVariant must not be null");
        }
        if (quantity == null) {
            throw new IllegalArgumentException("quantity must not be null");
        }
        if (importPrice == null) {
            throw new IllegalArgumentException("importPrice must not be null");
        }
        this.productVariant = productVariant;
        this.quantity = quantity;
        this.importPrice = importPrice;
        importLog.addItem(this);
    }

    public BigDecimal calculateLineTotal() {
        if (quantity == null) {
            throw new IllegalStateException("quantity must not be null");
        }
        if (importPrice == null) {
            throw new IllegalStateException("importPrice must not be null");
        }
        return importPrice.multiply(BigDecimal.valueOf(quantity));
    }

    public void changeQuantity(int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("quantity must be positive");
        }
        this.quantity = quantity;
    }

    public void changeImportPrice(BigDecimal importPrice) {
        if (importPrice == null) {
            throw new IllegalArgumentException("importPrice must not be null");
        }
        this.importPrice = importPrice;
    }
}
