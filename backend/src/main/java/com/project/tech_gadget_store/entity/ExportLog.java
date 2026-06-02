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
        this.performedBy = performedBy;
        this.reason = reason;
        performedBy.getExportLogs().add(this);
    }

    public void addItem(ExportLogItem item) {
        if (!items.contains(item)) {
            items.add(item);
        }
        item.setExportLog(this);
        if (!item.getProductVariant().getExportLogItems().contains(item)) {
            item.getProductVariant().getExportLogItems().add(item);
        }
    }
}
