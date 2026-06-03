package com.project.tech_gadget_store.entity;


import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import com.project.tech_gadget_store.entity.enums.ImportAndExportStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "export_logs")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ExportLog extends BaseEntity {

    @OneToMany(mappedBy = "exportLog", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExportLogItem> items = new ArrayList<>();

    @Column(name = "exported_at", nullable = false)
    private LocalDateTime exportedAt;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private ImportAndExportStatus status = ImportAndExportStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "performed_by", nullable = false)
    private Staff performedBy;

    @OneToOne(mappedBy = "exportLog", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Receipt receipt;

    @PrePersist
    protected void prePersistExportLog() {
        if (exportedAt == null) {
            exportedAt = LocalDateTime.now();
        }
    }

    public ExportLog(Staff performedBy, String reason) {
        if (performedBy == null) {
            throw new IllegalArgumentException("performedBy must not be null");
        }
        this.performedBy = performedBy;
        this.reason = reason;
        performedBy.getExportLogs().add(this);
    }

    public void addItem(ExportLogItem item) {
        if (item == null) {
            throw new IllegalArgumentException("item must not be null");
        }
        if (item.getExportLog() != null && item.getExportLog() != this) {
            item.getExportLog().getItems().remove(item);
        }
        if (!items.contains(item)) {
            items.add(item);
        }
        item.setExportLog(this);
        if (item.getProductVariant() != null && !item.getProductVariant().getExportLogItems().contains(item)) {
            item.getProductVariant().getExportLogItems().add(item);
        }
    }

    public void removeItem(ExportLogItem item) {
        if (item == null) {
            return;
        }
        if (items.remove(item)) {
            item.setExportLog(null);
            if (item.getProductVariant() != null) {
                item.getProductVariant().getExportLogItems().remove(item);
            }
        }
    }

    public void approve() {
        status = ImportAndExportStatus.APPROVED;
    }

    public void reject(String reason) {
        status = ImportAndExportStatus.REJECTED;
        this.reason = reason;
    }

    public void complete() {
        status = ImportAndExportStatus.COMPLETED;
    }

    public boolean isCompleted() {
        return ImportAndExportStatus.COMPLETED.equals(status);
    }

    public int calculateTotalQuantity() {
        int totalQuantity = 0;
        for (ExportLogItem item : items) {
            if (item == null) {
                throw new IllegalStateException("export log item must not be null");
            }
            if (item.getQuantity() == null) {
                throw new IllegalStateException("export log item quantity must not be null");
            }
            totalQuantity += item.getQuantity();
        }
        return totalQuantity;
    }

    public void assignReceipt(Receipt receipt) {
        if (receipt == null) {
            removeReceipt();
            return;
        }
        if (this.receipt == receipt) {
            receipt.setExportLog(this);
            return;
        }
        removeReceipt();
        if (receipt.getExportLog() != null && receipt.getExportLog() != this) {
            receipt.getExportLog().setReceipt(null);
        }
        this.receipt = receipt;
        receipt.setExportLog(this);
    }

    private void removeReceipt() {
        if (receipt == null) {
            return;
        }
        Receipt currentReceipt = receipt;
        receipt = null;
        currentReceipt.setExportLog(null);
    }
}
