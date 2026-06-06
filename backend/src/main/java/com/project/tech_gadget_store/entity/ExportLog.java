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

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "export_log_id", nullable = false)
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
    private User performedBy;

    @PrePersist
    protected void prePersistExportLog() {
        if (exportedAt == null) {
            exportedAt = LocalDateTime.now();
        }
    }

    public ExportLog(User performedBy, String reason) {
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
        if (!items.contains(item)) {
            items.add(item);
        }
    }

    public void removeItem(ExportLogItem item) {
        items.remove(item);
    }

    public void approve() {
        status = ImportAndExportStatus.SUCCESS;
    }

    public void reject(String reason) {
        status = ImportAndExportStatus.FAILURE;
        this.reason = reason;
    }

    public void complete() {
        status = ImportAndExportStatus.SUCCESS;
    }

    public boolean isCompleted() {
        return ImportAndExportStatus.SUCCESS.equals(status);
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

}
