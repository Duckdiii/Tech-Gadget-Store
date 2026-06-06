package com.project.tech_gadget_store.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "item_inventories")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ItemInventory extends BaseEntity {

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_variant_id", nullable = false)
    private ProductVariant productVariant;

    @Column(name = "quantity", nullable = false)
    private Integer quantity = 0;

    public ItemInventory(Inventory inventory, ProductVariant productVariant, Integer quantity) {
        if (quantity == null || quantity < 0) {
            throw new IllegalArgumentException("quantity must not be null or negative");
        }
        this.quantity = quantity;
        this.productVariant = productVariant;
        inventory.addItem(this);
        productVariant.addInventoryItem(this);
    }

    public void changeQuantity(Integer quantity) {
        if (quantity == null) {
            throw new IllegalArgumentException("quantity must not be null");
        }
        adjustQuantity(quantity);
    }

    public boolean hasEnoughStock(int requestedQuantity) {
        return requestedQuantity > 0 && quantity >= requestedQuantity;
    }

    public void increaseQuantity(int amount) {
        validatePositiveAmount(amount);
        quantity += amount;
    }

    public void decreaseQuantity(int amount) {
        validatePositiveAmount(amount);
        if (quantity - amount < 0) {
            throw new IllegalArgumentException("quantity cannot be negative");
        }
        quantity -= amount;
    }

    public void adjustQuantity(int newQuantity) {
        if (newQuantity < 0) {
            throw new IllegalArgumentException("newQuantity must not be negative");
        }
        quantity = newQuantity;
    }

    private void validatePositiveAmount(int amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("amount must be positive");
        }
    }
}
