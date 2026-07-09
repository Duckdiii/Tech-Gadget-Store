package com.project.tech_gadget_store.modules.catalog.entity;

import com.project.tech_gadget_store.common.entity.BaseEntity;
import com.project.tech_gadget_store.modules.auth.entity.Customer;
import com.project.tech_gadget_store.modules.loyalty.entity.enums.SubscriptionStatus;
import com.project.tech_gadget_store.modules.notification.entity.Notification;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;



@Entity
@Table(name = "favorite_products", uniqueConstraints = @UniqueConstraint(
        name = "uk_favorite_products_customer_product_variant",
        columnNames = { "customer_id", "product_variant_id" }))
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FavoriteProduct extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_variant_id", nullable = false)
    private ProductVariant productVariant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private SubscriptionStatus status = SubscriptionStatus.SUBSCRIBED;

    @Column(name = "is_favorite", nullable = false, columnDefinition = "boolean default true")
    private Boolean isFavorite = true;

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

    public FavoriteProduct(ProductVariant productVariant, Customer customer, SubscriptionStatus status) {
        if (productVariant == null) {
            throw new IllegalArgumentException("productVariant must not be null");
        }
        if (customer == null) {
            throw new IllegalArgumentException("customer must not be null");
        }
        if (status == null) {
            throw new IllegalArgumentException("status must not be null");
        }
        this.productVariant = productVariant;
        this.customer = customer;
        this.status = status;
        customer.getFavoriteProducts().add(this);
    }
}
