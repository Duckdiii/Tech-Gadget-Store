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
        this.performedBy = performedBy;
        performedBy.getImportLogs().add(this);
    }

    public void addItem(ImportLogItem item) {
        if (!items.contains(item)) {
            items.add(item);
        }
        item.setImportLog(this);
        if (!item.getProduct().getImportLogItems().contains(item)) {
            item.getProduct().getImportLogItems().add(item);
        }
    }
}
