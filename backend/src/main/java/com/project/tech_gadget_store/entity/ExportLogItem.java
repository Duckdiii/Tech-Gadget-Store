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
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    public ExportLogItem(ExportLog exportLog, Product product, Integer quantity) {
        this.exportLog = exportLog;
        this.product = product;
        this.quantity = quantity;
        if (!exportLog.getItems().contains(this)) {
            exportLog.getItems().add(this);
        }
        if (!product.getExportLogItems().contains(this)) {
            product.getExportLogItems().add(this);
        }
    }
}
