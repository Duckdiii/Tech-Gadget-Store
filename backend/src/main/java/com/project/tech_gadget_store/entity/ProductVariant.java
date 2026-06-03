package com.project.tech_gadget_store.entity;

import com.project.tech_gadget_store.entity.enums.ProductStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "product_variants", uniqueConstraints = @UniqueConstraint(name = "uk_product_variants_sku", columnNames = "sku"))
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProductVariant extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "ram_gb")
    private Integer ramGb;

    @Column(name = "storage_gb")
    private Integer storageGb;

    @Column(name = "color", length = 80)
    private String color;

    @Column(name = "price", precision = 15, scale = 2)
    private BigDecimal price;

    @Column(name = "sku", nullable = false, length = 80)
    private String sku;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private ProductStatus status = ProductStatus.AVAILABLE;

    @OneToOne(mappedBy = "productVariant", fetch = FetchType.LAZY)
    private InventoryItem inventoryItem;

    @OneToMany(mappedBy = "productVariant", fetch = FetchType.LAZY)
    private List<ImportLogItem> importLogItems = new ArrayList<>();

    @OneToMany(mappedBy = "productVariant", fetch = FetchType.LAZY)
    private List<ExportLogItem> exportLogItems = new ArrayList<>();

    public ProductVariant(Product product, Integer ramGb, Integer storageGb, String color, BigDecimal price,
            String sku) {
        this.ramGb = ramGb;
        this.storageGb = storageGb;
        this.color = color;
        this.price = price;
        if (sku == null) {
            throw new IllegalArgumentException("sku must not be null");
        }
        this.sku = sku;
        product.addVariant(this);
    }

    public void assignInventoryItem(InventoryItem inventoryItem) {
        if (inventoryItem == null) {
            throw new IllegalArgumentException("inventoryItem must not be null");
        }
        if (this.inventoryItem == inventoryItem) {
            inventoryItem.setProductVariant(this);
            return;
        }
        removeInventoryItem();
        if (inventoryItem.getProductVariant() != null && inventoryItem.getProductVariant() != this) {
            inventoryItem.getProductVariant().removeInventoryItem();
        }
        this.inventoryItem = inventoryItem;
        inventoryItem.setProductVariant(this);
        if (inventoryItem.getInventory() != null
                && !inventoryItem.getInventory().getItems().contains(inventoryItem)) {
            inventoryItem.getInventory().getItems().add(inventoryItem);
        }
    }

    public void removeInventoryItem() {
        if (inventoryItem == null) {
            return;
        }
        InventoryItem currentItem = inventoryItem;
        inventoryItem = null;
        currentItem.setProductVariant(null);
        if (currentItem.getInventory() != null) {
            currentItem.getInventory().getItems().remove(currentItem);
            currentItem.setInventory(null);
        }
    }

    public void changePrice(BigDecimal newPrice) {
        if (newPrice == null) {
            throw new IllegalArgumentException("newPrice must not be null");
        }
        this.price = newPrice;
    }

    public void changeStatus(ProductStatus status) {
        if (status == null) {
            throw new IllegalArgumentException("status must not be null");
        }
        this.status = status;
    }

    public void markAvailable() {
        status = ProductStatus.AVAILABLE;
    }

    public void markUnavailable() {
        status = ProductStatus.OUT_OF_STOCK;
    }

    public boolean isAvailable() {
        return ProductStatus.AVAILABLE.equals(status);
    }

    public Integer getQuantity() {
        return inventoryItem == null ? 0 : inventoryItem.getQuantity();
    }

    public Integer getReservedQuantity() {
        return inventoryItem == null ? 0 : inventoryItem.getReservedQuantity();
    }

    public Integer getAvailableQuantity() {
        return inventoryItem == null ? 0 : inventoryItem.getAvailableQuantity();
    }

    public boolean hasEnoughStock(int requestedQuantity) {
        return inventoryItem != null && inventoryItem.hasEnoughStock(requestedQuantity);
    }

    public Integer getQuantityIn(Inventory inventory) {
        return isStoredIn(inventory) ? getQuantity() : 0;
    }

    public Integer getReservedQuantityIn(Inventory inventory) {
        return isStoredIn(inventory) ? getReservedQuantity() : 0;
    }

    public Integer getAvailableQuantityIn(Inventory inventory) {
        return isStoredIn(inventory) ? getAvailableQuantity() : 0;
    }

    public boolean hasEnoughStockIn(Inventory inventory, int requestedQuantity) {
        return isStoredIn(inventory) && hasEnoughStock(requestedQuantity);
    }

    public boolean isStoredIn(Inventory inventory) {
        return inventory != null && inventoryItem != null && inventoryItem.getInventory() == inventory;
    }

    public String getDisplayName() {
        StringBuilder displayName = new StringBuilder();
        if (product != null && product.getName() != null && !product.getName().isBlank()) {
            displayName.append(product.getName());
        } else {
            displayName.append(sku);
        }

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
        if (!attributes.isEmpty()) {
            displayName.append(" - ").append(String.join(" / ", attributes));
        }
        return displayName.toString();
    }
}
