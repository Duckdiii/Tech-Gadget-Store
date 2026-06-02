package com.project.tech_gadget_store.entity;


import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class OrderItem extends BaseEntity {

    private static final int MAX_BUNDLE_SERVICES = 2;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @ManyToMany
    @JoinTable(
            name = "order_item_bundle_services",
            joinColumns = @JoinColumn(name = "order_item_id"),
            inverseJoinColumns = @JoinColumn(name = "bundle_service_id")
    )
    private List<BundleService> bundleServices = new ArrayList<>();

    @PrePersist
    @PreUpdate
    protected void validateBundleServicesLimit() {
        if (bundleServices != null && bundleServices.size() > MAX_BUNDLE_SERVICES) {
            throw new IllegalStateException("OrderItem chi duoc toi da 2 bundle services");
        }
    }

    @Column(name = "unit_price_at_order", nullable = false, precision = 15, scale = 2)
    private BigDecimal unitPriceAtOrder;

    public OrderItem(Order order, Product product, Integer quantity, BigDecimal unitPriceAtOrder) {
        this.order = order;
        this.product = product;
        this.quantity = quantity;
        this.unitPriceAtOrder = unitPriceAtOrder;
        order.getItems().add(this);
    }

    public void addBundleService(BundleService bundleService) {
        if (bundleServices.size() >= MAX_BUNDLE_SERVICES) {
            throw new IllegalStateException("OrderItem chi duoc toi da 2 bundle services");
        }
        bundleServices.add(bundleService);
        bundleService.getOrderItems().add(this);
    }
}
