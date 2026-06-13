package com.project.tech_gadget_store.entity;

import com.project.tech_gadget_store.entity.enums.SubscriptionStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "favorite_products", uniqueConstraints = @UniqueConstraint(name = "uk_favorite_products_customer_product", columnNames = {
        "customer_id", "product_id" }))
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FavoriteProduct extends BaseEntity {

    @Column(name = "product_id", nullable = false, length = 36)
    private String productId;

    @Column(name = "customer_id", nullable = false, length = 36)
    private String customerId;

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

    public FavoriteProduct(String productId, String customerId, SubscriptionStatus status) {
        if (productId == null || productId.isBlank()) {
            throw new IllegalArgumentException("productId must not be blank");
        }
        if (customerId == null || customerId.isBlank()) {
            throw new IllegalArgumentException("customerId must not be blank");
        }
        if (status == null) {
            throw new IllegalArgumentException("status must not be null");
        }
        this.productId = productId;
        this.customerId = customerId;
        this.status = status;
    }
}
