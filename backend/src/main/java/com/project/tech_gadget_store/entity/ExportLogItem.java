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
    @JoinColumn(name = "export_log_id", nullable = false)
    private ExportLog exportLog;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_variant_id", nullable = false)
    private ProductVariant productVariant;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    public ExportLogItem(ExportLog exportLog, ProductVariant productVariant, Integer quantity) {
        this.exportLog = exportLog;
        this.productVariant = productVariant;
        this.quantity = quantity;
        if (!exportLog.getItems().contains(this)) {
            exportLog.getItems().add(this);
        }
        if (!productVariant.getExportLogItems().contains(this)) {
            productVariant.getExportLogItems().add(this);
        }
    }
}
