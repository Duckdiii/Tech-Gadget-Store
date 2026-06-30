package com.project.tech_gadget_store.entity;

import com.project.tech_gadget_store.entity.enums.POStatus;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "supply_orders")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SupplyOrder extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private POStatus status = POStatus.PENDING;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "supply_order_id", nullable = false)
    private List<SupplyOrderItem> items = new ArrayList<>();

    @Column(name = "order_date", nullable = false)
    private LocalDate orderDate;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @PrePersist
    protected void prePersist() {
        if (orderDate == null) {
            orderDate = LocalDate.now();
        }
    }

    public SupplyOrder(Supplier supplier) {
        if (supplier == null) {
            throw new IllegalArgumentException("supplier must not be null");
        }
        this.supplier = supplier;
        this.status = POStatus.PENDING;
        this.orderDate = LocalDate.now();
    }

    public void addItem(SupplyOrderItem item) {
        if (item == null) {
            throw new IllegalArgumentException("item must not be null");
        }
        if (!items.contains(item)) {
            items.add(item);
        }
    }

    public void confirm() {
        if (status != POStatus.PENDING) {
            throw new IllegalStateException("Only PENDING orders can be confirmed");
        }
        this.status = POStatus.CONFIRMED;
    }

    public void ship() {
        if (status != POStatus.CONFIRMED) {
            throw new IllegalStateException("Only CONFIRMED orders can be shipped");
        }
        this.status = POStatus.SHIPPING;
    }

    public void deliver() {
        if (status != POStatus.SHIPPING) {
            throw new IllegalStateException("Only SHIPPING orders can be delivered");
        }
        this.status = POStatus.DELIVERED;
    }

    public void cancel() {
        if (status == POStatus.DELIVERED) {
            throw new IllegalStateException("DELIVERED orders cannot be cancelled");
        }
        this.status = POStatus.CANCELLED;
    }
}
