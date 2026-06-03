package com.project.tech_gadget_store.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.Objects;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "inventory_items")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class InventoryItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "inventory_id", nullable = false)
    private Inventory inventory;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_variant_id", nullable = false, unique = true)
    private ProductVariant productVariant;

    @Column(name = "quantity", nullable = false)
    private Integer quantity = 0;

    @Column(name = "reserved_quantity", nullable = false)
    private Integer reservedQuantity = 0;

    @Column(name = "last_updated_at")
    private LocalDateTime lastUpdatedAt;

    public InventoryItem(Inventory inventory, ProductVariant productVariant, Integer quantity, Integer reservedQuantity) {
        this.quantity = Objects.requireNonNull(quantity, "quantity must not be null");
        this.reservedQuantity = Objects.requireNonNull(reservedQuantity, "reservedQuantity must not be null");
        inventory.addItem(this);
        productVariant.assignInventoryItem(this);
    }

    public void changeQuantity(Integer quantity) {
        adjustQuantity(Objects.requireNonNull(quantity, "quantity must not be null"));
    }

    public void changeReservedQuantity(Integer reservedQuantity) {
        int newReservedQuantity = Objects.requireNonNull(reservedQuantity, "reservedQuantity must not be null");
        if (newReservedQuantity < 0) {
            throw new IllegalArgumentException("reservedQuantity must not be negative");
        }
        if (newReservedQuantity > quantity) {
            throw new IllegalArgumentException("reservedQuantity must not be greater than quantity");
        }
        this.reservedQuantity = newReservedQuantity;
    }

    public int getAvailableQuantity() {
        return Math.max(0, quantity - reservedQuantity);
    }

    public boolean hasEnoughStock(int requestedQuantity) {
        return requestedQuantity > 0 && getAvailableQuantity() >= requestedQuantity;
    }

    public void increaseQuantity(int amount) {
        validatePositiveAmount(amount);
        quantity += amount;
    }

    public void decreaseQuantity(int amount) {
        validatePositiveAmount(amount);
        if (quantity - amount < reservedQuantity) {
            throw new IllegalArgumentException("quantity cannot be less than reservedQuantity");
        }
        quantity -= amount;
    }

    public void reserve(int amount) {
        validatePositiveAmount(amount);
        if (!hasEnoughStock(amount)) {
            throw new IllegalArgumentException("not enough available stock");
        }
        reservedQuantity += amount;
    }

    public void releaseReserved(int amount) {
        validatePositiveAmount(amount);
        if (amount > reservedQuantity) {
            throw new IllegalArgumentException("amount cannot be greater than reservedQuantity");
        }
        reservedQuantity -= amount;
    }

    public void confirmReserved(int amount) {
        validatePositiveAmount(amount);
        if (amount > reservedQuantity) {
            throw new IllegalArgumentException("amount cannot be greater than reservedQuantity");
        }
        reservedQuantity -= amount;
        quantity -= amount;
    }

    public void adjustQuantity(int newQuantity) {
        if (newQuantity < 0) {
            throw new IllegalArgumentException("newQuantity must not be negative");
        }
        if (newQuantity < reservedQuantity) {
            throw new IllegalArgumentException("newQuantity cannot be less than reservedQuantity");
        }
        quantity = newQuantity;
    }

    private void validatePositiveAmount(int amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("amount must be positive");
        }
    }

    @PrePersist
    @PreUpdate
    protected void updateLastUpdatedAt() {
        lastUpdatedAt = LocalDateTime.now();
    }
}
