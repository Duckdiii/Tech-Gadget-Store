package com.project.tech_gadget_store.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "purchase_order_items")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PurchaseOrderItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_variant_id", nullable = false)
    private ProductVariant productVariant;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false)
    private BigDecimal unitPrice;

    public PurchaseOrderItem(PurchaseOrder purchaseOrder, ProductVariant productVariant, Integer quantity, BigDecimal unitPrice) {
        if (purchaseOrder == null) {
            throw new IllegalArgumentException("purchaseOrder must not be null");
        }
        if (productVariant == null) {
            throw new IllegalArgumentException("productVariant must not be null");
        }
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("quantity must be positive");
        }
        if (unitPrice == null) {
            throw new IllegalArgumentException("unitPrice must not be null");
        }
        this.productVariant = productVariant;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        purchaseOrder.addItem(this);
    }

    public BigDecimal calculateLineTotal() {
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }
}
