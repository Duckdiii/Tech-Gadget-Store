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

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "import_log_products",
            joinColumns = @JoinColumn(name = "import_log_id"),
            inverseJoinColumns = @JoinColumn(name = "product_id")
    )
    private List<Product> products = new ArrayList<>();

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "performed_by", nullable = false, unique = true)
    private Staff performedBy;

    @Column(name = "import_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal importPrice;

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

    public ImportLog(Staff performedBy, Integer quantity, BigDecimal importPrice) {
        this.performedBy = performedBy;
        this.quantity = quantity;
        this.importPrice = importPrice;
        performedBy.setImportLog(this);
    }

    public void addProduct(Product product) {
        products.add(product);
        product.getImportLogs().add(this);
    }
}
