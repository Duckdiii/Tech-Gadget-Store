package com.project.tech_gadget_store.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class OrderItem extends BaseEntity {

    private static final int MAX_BUNDLE_SERVICES = 2;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_variant_id", nullable = false)
    private ProductVariant productVariant;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "order_item_bundle_services", joinColumns = @JoinColumn(name = "order_item_id"), inverseJoinColumns = @JoinColumn(name = "bundle_service_id"))
    private List<BundleService> bundleServices = new ArrayList<>();

    @Column(name = "unit_price_at_order", nullable = false, precision = 15, scale = 2)
    private BigDecimal unitPriceAtOrder;

    @PrePersist
    @PreUpdate
    protected void validateBundleServicesLimit() {
        if (bundleServices != null && bundleServices.size() > MAX_BUNDLE_SERVICES) {
            throw new IllegalStateException("OrderItem chi duoc toi da 2 bundle services");
        }
    }

    public OrderItem(Order order, ProductVariant productVariant, Integer quantity, BigDecimal unitPriceAtOrder) {
        this.productVariant = productVariant;
        this.quantity = quantity;
        this.unitPriceAtOrder = unitPriceAtOrder;
        order.addItem(this);
    }

    public BigDecimal calculateSubtotal() {
        if (unitPriceAtOrder == null) {
            throw new IllegalStateException("unitPriceAtOrder must not be null");
        }
        if (quantity == null) {
            throw new IllegalStateException("quantity must not be null");
        }
        return unitPriceAtOrder.multiply(BigDecimal.valueOf(quantity));
    }

    public BigDecimal calculateBundleServiceTotal() {
        BigDecimal total = BigDecimal.ZERO;
        for (BundleService service : bundleServices) {
            if (service == null) {
                throw new IllegalStateException("bundle service must not be null");
            }
            if (service.getPrice() == null) {
                throw new IllegalStateException("bundle service price must not be null");
            }
            total = total.add(service.getPrice());
        }
        return total.multiply(BigDecimal.valueOf(quantity == null ? 0 : quantity));
    }

    public BigDecimal calculateTotal() {
        return calculateSubtotal().add(calculateBundleServiceTotal());
    }

    public void addBundleService(BundleService service) {
        if (service == null) {
            throw new IllegalArgumentException("service must not be null");
        }
        if (bundleServices.contains(service)) {
            return;
        }
        if (bundleServices.size() >= MAX_BUNDLE_SERVICES) {
            throw new IllegalStateException("OrderItem chi duoc toi da 2 bundle services");
        }
        bundleServices.add(service);
    }

    public void removeBundleService(BundleService service) {
        if (service == null) {
            return;
        }
        bundleServices.remove(service);
    }

    public boolean hasBundleService(BundleService service) {
        return service != null && bundleServices.contains(service);
    }
}
