package com.project.tech_gadget_store.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "supply_order_items")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SupplyOrderItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_variant_id", nullable = false)
    private ProductVariant product;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false, precision = 19, scale = 2)
    private BigDecimal unitPrice;

    public SupplyOrderItem(SupplyOrder supplyOrder, ProductVariant product, Integer quantity, BigDecimal unitPrice) {
        if (supplyOrder == null) {
            throw new IllegalArgumentException("supplyOrder must not be null");
        }
        if (product == null) {
            throw new IllegalArgumentException("product must not be null");
        }
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("quantity must be positive");
        }
        if (unitPrice == null || unitPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("unitPrice must not be null or negative");
        }
        this.product = product;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        supplyOrder.addItem(this);
    }

    public BigDecimal calculateLineTotal() {
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }
}
