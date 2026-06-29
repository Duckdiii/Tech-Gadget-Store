package com.project.tech_gadget_store.entity;

import com.project.tech_gadget_store.entity.enums.PurchaseOrderStatus;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "purchase_orders")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PurchaseOrder extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Column(name = "ordered_by", nullable = false, length = 36)
    private String orderedBy;

    @Column(name = "ordered_at", nullable = false)
    private LocalDateTime orderedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private PurchaseOrderStatus status = PurchaseOrderStatus.PENDING;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    private List<PurchaseOrderItem> items = new ArrayList<>();

    @PrePersist
    protected void prePersist() {
        if (orderedAt == null) {
            orderedAt = LocalDateTime.now();
        }
    }

    public PurchaseOrder(Supplier supplier, String orderedBy) {
        if (supplier == null) {
            throw new IllegalArgumentException("supplier must not be null");
        }
        if (orderedBy == null || orderedBy.isBlank()) {
            throw new IllegalArgumentException("orderedBy must not be blank");
        }
        this.supplier = supplier;
        this.orderedBy = orderedBy;
        this.status = PurchaseOrderStatus.PENDING;
    }

    public void addItem(PurchaseOrderItem item) {
        if (item == null) {
            throw new IllegalArgumentException("item must not be null");
        }
        if (!items.contains(item)) {
            items.add(item);
        }
    }

    public void approve() {
        if (status != PurchaseOrderStatus.PENDING) {
            throw new IllegalStateException("Only PENDING orders can be approved");
        }
        this.status = PurchaseOrderStatus.APPROVED;
    }

    public void receive() {
        if (status != PurchaseOrderStatus.APPROVED) {
            throw new IllegalStateException("Only APPROVED orders can be received");
        }
        this.status = PurchaseOrderStatus.RECEIVED;
    }

    public void cancel() {
        if (status == PurchaseOrderStatus.RECEIVED) {
            throw new IllegalStateException("RECEIVED orders cannot be cancelled");
        }
        this.status = PurchaseOrderStatus.CANCELLED;
    }

    public BigDecimal calculateTotalValue() {
        return items.stream()
                .map(PurchaseOrderItem::calculateLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
