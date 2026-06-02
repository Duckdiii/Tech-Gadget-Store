package com.project.tech_gadget_store.entity;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cart_items", uniqueConstraints = @UniqueConstraint(name = "uk_cart_items_cart_product", columnNames = {
                "cart_id", "product_id" }))
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CartItem extends BaseEntity {

        private static final int MAX_BUNDLE_SERVICES = 2;

        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "cart_id", nullable = false)
        private Cart cart;

        @OneToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "product_id", nullable = false, unique = true)
        private Product product;

        @Column(name = "quantity", nullable = false)
        private Integer quantity = 1;

        @Column(name = "selected_for_checkout", nullable = false)
        private Boolean selectedForCheckout = true;

        @ManyToMany
        @JoinTable(name = "cart_item_bundle_services", joinColumns = @JoinColumn(name = "cart_item_id"), inverseJoinColumns = @JoinColumn(name = "bundle_service_id"))
        private List<BundleService> bundleServices = new ArrayList<>();

        public CartItem(Cart cart, Product product, Integer quantity) {
                this.cart = cart;
                this.product = product;
                this.quantity = quantity;
                cart.getItems().add(this);
        }

        public void addBundleService(BundleService bundleService) {
                if (bundleServices.size() >= MAX_BUNDLE_SERVICES) {
                        throw new IllegalStateException("CartItem chi duoc toi da 2 bundle services");
                }
                bundleServices.add(bundleService);
                bundleService.getCartItems().add(this);
        }

        @PrePersist
        @PreUpdate
        protected void validateBundleServicesLimit() {
                if (bundleServices != null && bundleServices.size() > MAX_BUNDLE_SERVICES) {
                        throw new IllegalStateException("CartItem chi duoc toi da 2 bundle services");
                }
        }
}
