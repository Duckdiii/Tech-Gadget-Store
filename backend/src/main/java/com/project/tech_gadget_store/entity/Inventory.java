package com.project.tech_gadget_store.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
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

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "location", length = 255)
    private String location;

    @OneToMany(mappedBy = "inventory", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InventoryItem> items = new ArrayList<>();

    public Inventory(String name, String location) {
        this.name = Objects.requireNonNull(name, "name must not be null");
        this.location = location;
    }

    public void changeInfo(String name, String location) {
        this.name = Objects.requireNonNull(name, "name must not be null");
        this.location = location;
    }

    public void addItem(InventoryItem item) {
        Objects.requireNonNull(item, "item must not be null");
        if (item.getInventory() != null && item.getInventory() != this) {
            item.getInventory().getItems().remove(item);
        }
        if (!items.contains(item)) {
            items.add(item);
        }
        item.setInventory(this);
        if (item.getProductVariant() != null && item.getProductVariant().getInventoryItem() != item) {
            item.getProductVariant().assignInventoryItem(item);
        }
    }

    public void removeItem(InventoryItem item) {
        if (item == null) {
            return;
        }
        if (items.remove(item)) {
            item.setInventory(null);
            if (item.getProductVariant() != null) {
                item.getProductVariant().removeInventoryItem();
            }
        }
    }

    public InventoryItem findItem(ProductVariant productVariant) {
        if (productVariant == null) {
            return null;
        }
        return items.stream()
                .filter(item -> item.getProductVariant() == productVariant)
                .findFirst()
                .orElse(null);
    }

    public boolean containsVariant(ProductVariant productVariant) {
        return findItem(productVariant) != null;
    }

    public int getQuantity() {
        return items.stream()
                .map(InventoryItem::getQuantity)
                .filter(Objects::nonNull)
                .reduce(0, Integer::sum);
    }

    public int getReservedQuantity() {
        return items.stream()
                .map(InventoryItem::getReservedQuantity)
                .filter(Objects::nonNull)
                .reduce(0, Integer::sum);
    }

    public int getAvailableQuantity() {
        return Math.max(0, getQuantity() - getReservedQuantity());
    }

    public boolean hasEnoughStock(int amount) {
        return amount > 0 && getAvailableQuantity() >= amount;
    }

    public boolean hasEnoughStock(ProductVariant productVariant, int requestedQuantity) {
        InventoryItem item = findItem(productVariant);
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

    private InventoryItem getRequiredItem(ProductVariant productVariant) {
        InventoryItem item = findItem(productVariant);
        if (item == null) {
            throw new IllegalArgumentException("Inventory item not found for product variant");
        }
        return item;
    }
}
