package com.project.tech_gadget_store.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

    @Column(name = "product_variant_id", nullable = false, length = 36)
    private String productVariantId;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "import_price", nullable = false)
    private BigDecimal importPrice;

    public ImportLogItem(ImportLog importLog, String productVariantId, Integer quantity, BigDecimal importPrice) {
        this.productVariantId = productVariantId;
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
