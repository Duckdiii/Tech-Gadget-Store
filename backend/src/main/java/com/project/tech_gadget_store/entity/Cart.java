package com.project.tech_gadget_store.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "carts")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Cart extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false, unique = true)
    private Customer customer;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "cart_id", nullable = false)
    private List<CartItem> items = new ArrayList<>();

    public Cart(Customer customer) {
        if (customer == null) {
            throw new IllegalArgumentException("customer must not be null");
        }
        this.customer = customer;
        customer.setCart(this);
    }

    public void addItem(CartItem item) {
        if (item == null) {
            throw new IllegalArgumentException("item must not be null");
        }
        if (!items.contains(item)) {
            items.add(item);
        }
    }

    public void addItem(ProductVariant variant, int quantity) {
        if (variant == null) {
            throw new IllegalArgumentException("variant must not be null");
        }
        validatePositiveQuantity(quantity);

        CartItem existingItem = findSimpleItemByVariant(variant);
        if (existingItem != null) {
            existingItem.increaseQuantity(quantity);
            return;
        }

        new CartItem(this, variant, quantity);
    }

    public void removeItem(CartItem item) {
        if (item == null) {
            return;
        }
        if (items.remove(item)) {
            for (BundleService bundleService : new ArrayList<>(item.getBundleServices())) {
                item.removeBundleService(bundleService);
            }
        }
    }

    public void removeItemByVariant(ProductVariant variant) {
        if (variant == null) {
            return;
        }
        new ArrayList<>(items).stream()
                .filter(item -> item.getProductVariant() == variant)
                .forEach(this::removeItem);
    }

    public void clear() {
        new ArrayList<>(items).forEach(this::removeItem);
    }

    public List<CartItem> getSelectedItems() {
        return items.stream()
                .filter(CartItem::isSelected)
                .toList();
    }

    public boolean isEmpty() {
        return items.isEmpty();
    }

    public BigDecimal calculateSelectedTotal() {
        return getSelectedItems().stream()
                .map(CartItem::calculateSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public void selectAllItems() {
        items.forEach(CartItem::selectForCheckout);
    }

    public void unselectAllItems() {
        items.forEach(CartItem::unselectForCheckout);
    }

    private CartItem findSimpleItemByVariant(ProductVariant variant) {
        return items.stream()
                .filter(item -> item.getProductVariant() == variant)
                .filter(item -> item.getBundleServices() == null || item.getBundleServices().isEmpty())
                .findFirst()
                .orElse(null);
    }

    private void validatePositiveQuantity(int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("quantity must be positive");
        }
    }
}
