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
@Table(name = "import_log_items")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ImportLogItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "import_log_id", nullable = false)
    private ImportLog importLog;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_variant_id", nullable = false)
    private ProductVariant productVariant;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "import_price", nullable = false)
    private Double importPrice;

    public ImportLogItem(ImportLog importLog, ProductVariant productVariant, Integer quantity, Double importPrice) {
        this.importLog = importLog;
        this.productVariant = productVariant;
        this.quantity = quantity;
        this.importPrice = importPrice;
        if (!importLog.getItems().contains(this)) {
            importLog.getItems().add(this);
        }
        if (!productVariant.getImportLogItems().contains(this)) {
            productVariant.getImportLogItems().add(this);
        }
    }
}
