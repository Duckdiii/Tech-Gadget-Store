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

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "import_log_id", nullable = false)
    private List<ImportLogItem> items = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "performed_by", nullable = false)
    private User performedBy;

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

    public ImportLog(User performedBy) {

        this.performedBy = performedBy;
        performedBy.getImportLogs().add(this);
    }

    public void addItem(ImportLogItem item) {
        if (item == null) {
            throw new IllegalArgumentException("item must not be null");
        }
        if (!items.contains(item)) {
            items.add(item);
        }
    }

    public void removeItem(ImportLogItem item) {
        items.remove(item);
    }

    public void approve() {
        status = ImportAndExportStatus.SUCCESS;
    }

    public void reject(String reason) {
        status = ImportAndExportStatus.FAILURE;
        note = reason;
    }

    public void complete() {
        status = ImportAndExportStatus.SUCCESS;
    }

    public boolean isCompleted() {
        return ImportAndExportStatus.SUCCESS.equals(status);
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
