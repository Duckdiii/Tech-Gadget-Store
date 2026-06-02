package com.project.tech_gadget_store.entity;


import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "inventories")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Inventory extends BaseEntity {

    @OneToMany(mappedBy = "inventory", fetch = FetchType.LAZY)
    private List<Product> products = new ArrayList<>();

    @Column(name = "quantity", nullable = false)
    private Integer quantity = 0;

    @Column(name = "reserved_quantity", nullable = false)
    private Integer reservedQuantity = 0;

    @Column(name = "last_updated_at")
    private LocalDateTime lastUpdatedAt;

    @PrePersist
    @PreUpdate
    protected void updateLastUpdatedAt() {
        lastUpdatedAt = LocalDateTime.now();
    }

    public Inventory(Integer quantity, Integer reservedQuantity) {
        this.quantity = quantity;
        this.reservedQuantity = reservedQuantity;
    }

    public void addProduct(Product product) {
        products.add(product);
        product.setInventory(this);
    }
}
