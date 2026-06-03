package com.project.tech_gadget_store.entity;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import com.project.tech_gadget_store.entity.enums.ImportAndExportStatus;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "import_logs")
@Getter
@Setter

@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ImportLog extends BaseEntity {

    @OneToMany(mappedBy = "importLog", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ImportLogItem> items = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "performed_by", nullable = false)
    private Staff performedBy;

    @Column(name = "imported_at", nullable = false)
    private LocalDateTime importedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private ImportAndExportStatus status = ImportAndExportStatus.PENDING;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @PrePersist
    protected void prePersistImportLog() {
        if (importedAt == null) {
            importedAt = LocalDateTime.now();
        }
    }

    public ImportLog(Staff performedBy) {
        if (performedBy == null) {
            throw new IllegalArgumentException("performedBy must not be null");
        }
        this.performedBy = performedBy;
        performedBy.getImportLogs().add(this);
    }

    public void addItem(ImportLogItem item) {
        if (item == null) {
            throw new IllegalArgumentException("item must not be null");
        }
        if (item.getImportLog() != null && item.getImportLog() != this) {
            item.getImportLog().getItems().remove(item);
        }
        if (!items.contains(item)) {
            items.add(item);
        }
        item.setImportLog(this);
        if (item.getProductVariant() != null && !item.getProductVariant().getImportLogItems().contains(item)) {
            item.getProductVariant().getImportLogItems().add(item);
        }
    }

    public void removeItem(ImportLogItem item) {
        if (item == null) {
            return;
        }
        if (items.remove(item)) {
            item.setImportLog(null);
            if (item.getProductVariant() != null) {
                item.getProductVariant().getImportLogItems().remove(item);
            }
        }
    }

    public void approve() {
        status = ImportAndExportStatus.APPROVED;
    }

    public void reject(String reason) {
        status = ImportAndExportStatus.REJECTED;
        note = reason;
    }

    public void complete() {
        status = ImportAndExportStatus.COMPLETED;
    }

    public boolean isCompleted() {
        return ImportAndExportStatus.COMPLETED.equals(status);
    }

    public int calculateTotalQuantity() {
        int totalQuantity = 0;
        for (ImportLogItem item : items) {
            if (item == null) {
                throw new IllegalStateException("import log item must not be null");
            }
            if (item.getQuantity() == null) {
                throw new IllegalStateException("import log item quantity must not be null");
            }
            totalQuantity += item.getQuantity();
        }
        return totalQuantity;
    }

    public BigDecimal calculateTotalImportValue() {
        BigDecimal totalValue = BigDecimal.ZERO;
        for (ImportLogItem item : items) {
            if (item == null) {
                throw new IllegalStateException("import log item must not be null");
            }
            totalValue = totalValue.add(item.calculateLineTotal());
        }
        return totalValue;
    }
}
