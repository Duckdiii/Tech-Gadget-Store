package com.project.tech_gadget_store.entity;

import com.project.tech_gadget_store.entity.enums.SubscriptionStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;
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

    @PrePersist
    protected void prePersistFavoriteProduct() {
        if (subscribedAt == null) {
            subscribedAt = LocalDateTime.now();
        }
    }

    public FavoriteProduct(String productId, String customerId, SubscriptionStatus status) {
        this.productId = productId;
        this.customerId = customerId;
        if (status != null) this.status = status;
    }
}
