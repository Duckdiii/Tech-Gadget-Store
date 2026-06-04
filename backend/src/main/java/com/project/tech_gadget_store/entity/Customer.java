package com.project.tech_gadget_store.entity;


import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import com.project.tech_gadget_store.entity.enums.OrderStatus;
import com.project.tech_gadget_store.entity.enums.SubscriptionStatus;

@Entity
@Table(name = "customers")
@DiscriminatorValue("CUSTOMER")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Customer extends User {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "membership_id")
    private Membership membership;

    @OneToOne(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Cart cart;

    @OneToMany(mappedBy = "customer", fetch = FetchType.LAZY)
    private List<Order> orders = new ArrayList<>();

    @OneToMany(mappedBy = "customer", fetch = FetchType.LAZY)
    private List<ProductSubscription> productSubscriptions = new ArrayList<>();

    public Customer(String fullName, String phone) {
        super(fullName, phone);
    }

    public Customer(String fullName, String phone, Membership membership) {
        super(fullName, phone);
        assignMembership(membership);
    }

    public void assignMembership(Membership membership) {
        if (this.membership == membership) {
            return;
        }
        if (this.membership != null) {
            this.membership.getCustomers().remove(this);
        }
        this.membership = membership;
        if (membership != null && !membership.getCustomers().contains(this)) {
            membership.getCustomers().add(this);
        }
    }

    public void createCartIfAbsent() {
        if (cart == null) {
            cart = new Cart(this);
        }
    }

    public void addNotification(Notification notification) {
        if (notification == null) {
            throw new IllegalArgumentException("notification must not be null");
        }
        ProductSubscription subscription = notification.getProductSubscription();
        if (subscription == null) {
            throw new IllegalArgumentException("notification productSubscription must not be null");
        }
        if (subscription.getCustomer() != this) {
            throw new IllegalArgumentException("notification does not belong to this customer");
        }
        subscription.addNotification(notification);
    }

    public void subscribeProduct(Product product) {
        if (product == null) {
            throw new IllegalArgumentException("product must not be null");
        }
        ProductSubscription existingSubscription = findSubscription(product);
        if (existingSubscription != null) {
            existingSubscription.setStatus(SubscriptionStatus.SUBSCRIBED);
            existingSubscription.setUnsubscribedAt(null);
            return;
        }
        new ProductSubscription(product, this);
    }

    public void unsubscribeProduct(Product product) {
        if (product == null) {
            throw new IllegalArgumentException("product must not be null");
        }
        ProductSubscription existingSubscription = findSubscription(product);
        if (existingSubscription == null) {
            return;
        }
        existingSubscription.setStatus(SubscriptionStatus.UNSUBSCRIBED);
        existingSubscription.setUnsubscribedAt(java.time.LocalDateTime.now());
    }

    public BigDecimal calculateTotalSpending() {
        BigDecimal totalSpending = BigDecimal.ZERO;
        for (Order order : orders) {
            if (order == null) {
                throw new IllegalStateException("order must not be null");
            }
            if (OrderStatus.COMPLETED.equals(order.getOrderStatus())) {
                totalSpending = totalSpending.add(order.calculateTotal());
            }
        }
        return totalSpending;
    }

    private ProductSubscription findSubscription(Product product) {
        for (ProductSubscription subscription : productSubscriptions) {
            if (subscription == null) {
                throw new IllegalStateException("productSubscription must not be null");
            }
            if (subscription.getProduct() == product) {
                return subscription;
            }
        }
        return null;
    }
}
