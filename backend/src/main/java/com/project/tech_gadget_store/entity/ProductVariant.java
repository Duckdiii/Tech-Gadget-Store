package com.project.tech_gadget_store.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "product_variants")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProductVariant extends BaseEntity {

    @Column(name = "ram_gb")
    private Integer ramGb;

    @Column(name = "storage_gb")
    private Integer storageGb;

    @Column(name = "color", length = 80)
    private String color;

    @Column(name = "price", precision = 15, scale = 2)
    private BigDecimal price;

    @OneToMany(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_variant_id")
    private List<ItemInventory> inventoryItems = new ArrayList<>();

    public ProductVariant(Product product, Integer ramGb, Integer storageGb, String color, BigDecimal price) {
        this.ramGb = ramGb;
        this.storageGb = storageGb;
        this.color = color;
        this.price = price;
        product.addVariant(this);
    }

    public void addInventoryItem(ItemInventory inventoryItem) {
        if (inventoryItem == null) {
            throw new IllegalArgumentException("inventoryItem must not be null");
        }
        if (!inventoryItems.contains(inventoryItem)) {
            inventoryItems.add(inventoryItem);
        }
    }

    public void removeInventoryItem(ItemInventory inventoryItem) {
        inventoryItems.remove(inventoryItem);
    }

    public void changePrice(BigDecimal newPrice) {
        if (newPrice == null) {
            throw new IllegalArgumentException("newPrice must not be null");
        }
        this.price = newPrice;
    }

    public Integer getQuantity() {
        return inventoryItems.stream().mapToInt(ItemInventory::getQuantity).sum();
    }

    public Integer getReservedQuantity() {
        return inventoryItems.stream().mapToInt(ItemInventory::getReservedQuantity).sum();
    }

    public Integer getAvailableQuantity() {
        return inventoryItems.stream().mapToInt(ItemInventory::getAvailableQuantity).sum();
    }

    public boolean hasEnoughStock(int requestedQuantity) {
        return requestedQuantity > 0 && getAvailableQuantity() >= requestedQuantity;
    }

    public Integer getQuantityIn(Inventory inventory) {
        ItemInventory item = findInventoryItem(inventory);
        return item == null ? 0 : item.getQuantity();
    }

    public Integer getReservedQuantityIn(Inventory inventory) {
        ItemInventory item = findInventoryItem(inventory);
        return item == null ? 0 : item.getReservedQuantity();
    }

    public Integer getAvailableQuantityIn(Inventory inventory) {
        ItemInventory item = findInventoryItem(inventory);
        return item == null ? 0 : item.getAvailableQuantity();
    }

    public boolean hasEnoughStockIn(Inventory inventory, int requestedQuantity) {
        ItemInventory item = findInventoryItem(inventory);
        return item != null && item.hasEnoughStock(requestedQuantity);
    }

    public boolean isStoredIn(Inventory inventory) {
        return findInventoryItem(inventory) != null;
    }

    private ItemInventory findInventoryItem(Inventory inventory) {
        if (inventory == null) {
            return null;
        }
        return inventory.findItem(this);
    }

    public String getDisplayName() {
        List<String> attributes = new ArrayList<>();
        if (ramGb != null) {
            attributes.add(ramGb + "GB RAM");
        }
        if (storageGb != null) {
            attributes.add(storageGb + "GB Storage");
        }
        if (color != null && !color.isBlank()) {
            attributes.add(color);
        }
        return attributes.isEmpty() ? "Product Variant" : String.join(" / ", attributes);
    }
}
