package com.project.tech_gadget_store.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "inventories")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Inventory extends BaseEntity {

    @Column(name = "location", length = 255)
    private String location;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "inventory_id", nullable = false)
    private List<ItemInventory> items = new ArrayList<>();

    public Inventory(String location) {
        this.location = location;
    }

    public void changeLocation(String location) {
        this.location = location;
    }

    public void addItem(ItemInventory item) {
        if (item == null) {
            throw new IllegalArgumentException("item must not be null");
        }
        if (!items.contains(item)) {
            items.add(item);
        }
    }

    public void removeItem(ItemInventory item) {
        items.remove(item);
    }

    public ItemInventory findItem(ProductVariant productVariant) {
        if (productVariant == null) {
            return null;
        }
        return productVariant.getInventoryItems().stream()
                .filter(items::contains)
                .findFirst()
                .orElse(null);
    }

    public boolean containsVariant(ProductVariant productVariant) {
        return findItem(productVariant) != null;
    }

    public int getQuantity() {
        int totalQuantity = 0;
        for (ItemInventory item : items) {
            if (item == null) {
                throw new IllegalStateException("inventory item must not be null");
            }
            if (item.getQuantity() == null) {
                throw new IllegalStateException("inventory item quantity must not be null");
            }
            totalQuantity += item.getQuantity();
        }
        return totalQuantity;
    }

    public int getReservedQuantity() {
        int totalReservedQuantity = 0;
        for (ItemInventory item : items) {
            if (item == null) {
                throw new IllegalStateException("inventory item must not be null");
            }
            if (item.getReservedQuantity() == null) {
                throw new IllegalStateException("inventory item reservedQuantity must not be null");
            }
            totalReservedQuantity += item.getReservedQuantity();
        }
        return totalReservedQuantity;
    }

    public int getAvailableQuantity() {
        return Math.max(0, getQuantity() - getReservedQuantity());
    }

    public boolean hasEnoughStock(int amount) {
        return amount > 0 && getAvailableQuantity() >= amount;
    }

    public boolean hasEnoughStock(ProductVariant productVariant, int requestedQuantity) {
        ItemInventory item = findItem(productVariant);
        return item != null && item.hasEnoughStock(requestedQuantity);
    }

    public void increaseQuantity(ProductVariant productVariant, int amount) {
        getRequiredItem(productVariant).increaseQuantity(amount);
    }

    public void decreaseQuantity(ProductVariant productVariant, int amount) {
        getRequiredItem(productVariant).decreaseQuantity(amount);
    }

    public void reserve(ProductVariant productVariant, int amount) {
        getRequiredItem(productVariant).reserve(amount);
    }

    public void releaseReserved(ProductVariant productVariant, int amount) {
        getRequiredItem(productVariant).releaseReserved(amount);
    }

    public void confirmReserved(ProductVariant productVariant, int amount) {
        getRequiredItem(productVariant).confirmReserved(amount);
    }

    public void adjustQuantity(ProductVariant productVariant, int newQuantity) {
        getRequiredItem(productVariant).adjustQuantity(newQuantity);
    }

    private ItemInventory getRequiredItem(ProductVariant productVariant) {
        ItemInventory item = findItem(productVariant);
        if (item == null) {
            throw new IllegalArgumentException("Inventory item not found for product variant");
        }
        return item;
    }
}
