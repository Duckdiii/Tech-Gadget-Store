package com.project.tech_gadget_store.entity;

import com.project.tech_gadget_store.entity.enums.SubscriptionStatus;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "favorite_products", uniqueConstraints = @UniqueConstraint(
        name = "uk_favorite_products_customer_product",
        columnNames = { "customer_id", "product_id" }))
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FavoriteProduct extends BaseEntity {

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

    @OneToMany(mappedBy = "favoriteProduct", fetch = FetchType.LAZY)
    private List<Notification> notifications = new ArrayList<>();

    @PrePersist
    protected void prePersistFavoriteProduct() {
        if (subscribedAt == null) {
            subscribedAt = LocalDateTime.now();
        }
    }

    public FavoriteProduct(Product product, Customer customer, SubscriptionStatus status) {
        if (product == null) {
            throw new IllegalArgumentException("product must not be null");
        }
        if (customer == null) {
            throw new IllegalArgumentException("customer must not be null");
        }
        if (status == null) {
            throw new IllegalArgumentException("status must not be null");
        }
        this.product = product;
        this.customer = customer;
        this.status = status;
        product.getFavoriteProducts().add(this);
        customer.getFavoriteProducts().add(this);
    }
}
