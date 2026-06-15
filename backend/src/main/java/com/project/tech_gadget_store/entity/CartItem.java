package com.project.tech_gadget_store.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
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
@Table(name = "cart_items")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CartItem extends BaseEntity {

        private static final int MAX_BUNDLE_SERVICES = 2;

        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "product_variant_id", nullable = false)
        private ProductVariant productVariant;

        @Column(name = "quantity", nullable = false)
        private Integer quantity = 1;

        @ManyToMany(fetch = FetchType.LAZY)
        @JoinTable(name = "cart_item_bundle_services", joinColumns = @JoinColumn(name = "cart_item_id"), inverseJoinColumns = @JoinColumn(name = "bundle_service_id"))
        private List<BundleService> bundleServices = new ArrayList<>();

        public CartItem(Cart cart, ProductVariant productVariant, Integer quantity) {
                if (cart == null) {
                        throw new IllegalArgumentException("cart must not be null");
                }
                if (productVariant == null) {
                        throw new IllegalArgumentException("productVariant must not be null");
                }
                this.productVariant = productVariant;
                changeQuantity(quantity);
                cart.addItem(this);
        }

        public void increaseQuantity(int amount) {
                validatePositiveAmount(amount);
                quantity += amount;
        }

        public void decreaseQuantity(int amount) {
                validatePositiveAmount(amount);
                changeQuantity(quantity - amount);
        }

        public void changeQuantity(int quantity) {
                if (quantity <= 0) {
                        throw new IllegalArgumentException("quantity must be positive");
                }
                this.quantity = quantity;
        }

        public BigDecimal getUnitPrice() {
                if (productVariant == null || productVariant.getPrice() == null) {
                        return BigDecimal.ZERO;
                }
                return productVariant.getPrice();
        }

        public BigDecimal calculateSubtotal() {
                BigDecimal bundlePrice = BigDecimal.ZERO;
                for (BundleService service : bundleServices) {
                        if (service == null) {
                                throw new IllegalStateException("bundle service must not be null");
                        }
                        if (service.getPrice() == null) {
                                throw new IllegalStateException("bundle service price must not be null");
                        }
                        bundlePrice = bundlePrice.add(service.getPrice());
                }
                return getUnitPrice()
                                .add(bundlePrice)
                                .multiply(BigDecimal.valueOf(quantity));
        }

        public void addBundleService(BundleService service) {
                if (service == null) {
                        throw new IllegalArgumentException("service must not be null");
                }
                if (bundleServices.contains(service)) {
                        return;
                }
                if (bundleServices.size() >= MAX_BUNDLE_SERVICES) {
                        throw new IllegalStateException("CartItem chi duoc toi da 2 bundle services");
                }
                bundleServices.add(service);
        }

        public void removeBundleService(BundleService service) {
                if (service == null) {
                        return;
                }
                bundleServices.remove(service);
        }

        @PrePersist
        @PreUpdate
        protected void validateBundleServicesLimit() {
                if (bundleServices != null && bundleServices.size() > MAX_BUNDLE_SERVICES) {
                        throw new IllegalStateException("CartItem chi duoc toi da 2 bundle services");
                }
        }

        private void validatePositiveAmount(int amount) {
                if (amount <= 0) {
                        throw new IllegalArgumentException("amount must be positive");
                }
        }
}
