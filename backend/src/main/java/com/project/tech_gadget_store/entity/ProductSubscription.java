package com.project.tech_gadget_store.entity;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import com.project.tech_gadget_store.entity.enums.SubscriptionStatus;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "product_subscriptions",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_product_subscriptions_customer_product",
                columnNames = {"customer_id", "product_id"}
        )
)
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProductSubscription extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private SubscriptionStatus status = SubscriptionStatus.SUBSCRIBED;

    @Column(name = "subscribed_at", nullable = false)
    private LocalDateTime subscribedAt;

    @Column(name = "unsubscribed_at")
    private LocalDateTime unsubscribedAt;

    @OneToMany(mappedBy = "productSubscription", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Notification> notifications = new ArrayList<>();

    @PrePersist
    protected void prePersistProductSubscription() {
        if (subscribedAt == null) {
            subscribedAt = LocalDateTime.now();
        }
    }

    public ProductSubscription(Product product, Customer customer) {
        if (product == null) {
            throw new IllegalArgumentException("product must not be null");
        }
        if (customer == null) {
            throw new IllegalArgumentException("customer must not be null");
        }
        this.product = product;
        this.customer = customer;
        customer.getProductSubscriptions().add(this);
        product.getProductSubscriptions().add(this);
    }

    public void addNotification(Notification notification) {
        if (notification == null) {
            throw new IllegalArgumentException("notification must not be null");
        }
        if (notification.getProductSubscription() != null && notification.getProductSubscription() != this) {
            notification.getProductSubscription().getNotifications().remove(notification);
        }
        if (!notifications.contains(notification)) {
            notifications.add(notification);
        }
        notification.setProductSubscription(this);
    }

    public void removeNotification(Notification notification) {
        if (notification == null) {
            return;
        }
        if (notifications.remove(notification)) {
            notification.setProductSubscription(null);
        }
    }
}
